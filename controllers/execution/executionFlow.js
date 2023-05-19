/**
 * This file contains functions to execute the monitoring of scripts, creation of issues,
 * and delivery of feedback.
 */
import hash from 'object-hash';

import { MonitoredScripts } from '../../models/monitoredScripts.js';
import { ActiveIssues } from '../../models/activeIssues.js';
import { ArchivedIssues } from '../../models/archivedIssues.js';
import { createActiveIssue } from './imports/activeIssuesController.js';

import { ExecutionEnv } from './executionEnv.js';
import {
  executeSituationDetector,
  executeStrategies,
  computeApplicableSet,
  getRefreshedObjsForTarget,
} from './executionFns.js';
import { floorDateToNearestFiveMinutes } from '../../imports/utils.js';

/**
 * Checks if any of the monitored scripts have triggered.
 * TODO: error checking
 * @returns {Promise<Array<HydratedDocument<T & Document<any, any, any>, {}, {}>>>}
 */
export const checkMonitoredScripts = async () => {
  // store current date to use for created issues
  let currDate = floorDateToNearestFiveMinutes(new Date());

  // fetch all monitored scripts
  let monitoredScripts = await MonitoredScripts.find({}).lean();

  // for each script, check script condition and create an issue if triggered
  let generatedIssues = [];
  for (let currScript of monitoredScripts) {
    // pre-processing: convert fields with string functions to actual functions
    currScript.applicable_set = new Function(
      `return ${currScript.applicable_set}`
    )();
    currScript.situation_detector = new Function(
      `return ${currScript.situation_detector}`
    )();
    currScript.strategies.forEach((currStrategy, index, arr) => {
      arr[index] = {
        name: currStrategy.name,
        description: currStrategy.description,
        strategy_function: new Function(
          `return ${currStrategy.strategy_function}`
        )(),
      };
    });

    // generate the applicable set for script
    let applicableSet = await computeApplicableSet(currScript.applicable_set);

    // run detector for each target, and create issues for each target-detector pair that is true
    for (const currOrgObjTarget of applicableSet) {
      // refresh targets given the current target type
      // TODO: a future optimization would be to not run these commands (since the data was just pulled) and instead filter computedTargets for the currTarget
      let refreshedOrgObjs = await getRefreshedObjsForTarget(currOrgObjTarget);

      // run the situation detector to see if the script has triggered
      let scriptDidTrigger = await executeSituationDetector(
        refreshedOrgObjs,
        currScript.situation_detector
      );

      // store triggered scripts as a new active issue
      if (scriptDidTrigger) {
        // check if issue already exists in database
        // match on both the script ID and the hash of the target b/c together they are unique
        // TODO: this is buggy if the tools update -- should do it on everything but the tools I think
        const targetHash = hash({
          targetType: currOrgObjTarget.targetType,
          name: currOrgObjTarget.name,
        });

        let foundIssue = await ActiveIssues.findOne({
          script_id: currScript._id,
          target_hash: targetHash,
        }).exec();

        // create a new active issue if it doesn't exist already
        if (foundIssue === null) {
          generatedIssues.push(
            createActiveIssue(
              currScript._id,
              currScript.name,
              currDate,
              computeExpiryTimeForScript(currDate, currScript.timeframe),
              currScript.repeat,
              currOrgObjTarget,
              targetHash,
              await computeStrategies(refreshedOrgObjs, currScript.strategies)
            )
          );
        }
      }
    }
  }

  return ActiveIssues.insertMany(generatedIssues);
};

/**
 * Checks if any active issues should have their strategies presented at upcoming venues.
 * @return {Promise<*[]>} list of strategies that were presented.
 */
export const checkActiveIssues = async () => {
  // get all issues
  let activeIssues = await ActiveIssues.find({}).lean();

  // hold date for checking all of these issues
  let currDate = floorDateToNearestFiveMinutes(new Date());

  // for each issue, check if any of the strategies should be presented and track which ones were
  let presentedStrategies = [];

  for (const currIssue of activeIssues) {
    // get the updated org objs for the issue since data can change between
    // the detector being triggered and the situation for the feedback to be presented
    let refreshedOrgObjs = await getRefreshedObjsForTarget(
      currIssue.issue_target
    );

    // check each strategy to see if it's time to deliver it
    for (const currCompStrat of currIssue.computed_strategies) {
      // convert outlet fn back to a function
      currCompStrat.outlet_fn = new Function(
        `return ${currCompStrat.outlet_fn}`
      )();

      // TODO: this will fail since its looking for a direct match. Need to round this down.
      // TODO: in the future, may want to change it to currTime >= oppTime (or on the same day, but >= time). This will need to check, though, if a ping has been sent for an active issue.
      // check if it's time to deliver the current strategy
      if (currDate.getTime() === currCompStrat.opportunity.getTime()) {
        // execute strategy by creating an execution env with the refreshed org objs and outlet_fn
        let stratExecutionEnv = new ExecutionEnv(
          refreshedOrgObjs,
          currCompStrat.outlet_fn
        );
        await stratExecutionEnv.runScript(currCompStrat.outlet_args);

        // add to triggered feedback list
        presentedStrategies.push({
          name: currIssue.name,
          issue_target: currIssue.issue_target,
          delivered_strategy: currCompStrat,
        });
      }
    }
  }

  // TODO: could store this in a separate collection
  return presentedStrategies;
};

/**
 * Checks if any active issues should be archived or reset.
 * @return {Promise<unknown[]>}
 */
export const archiveStaleIssues = async () => {
  // get all issues
  let activeIssues = await ActiveIssues.find({}).lean();

  // use the following date to check what issues to archive
  let currDate = floorDateToNearestFiveMinutes(new Date());

  // for each issue, check to see if we're past the expiry time
  let issuesToArchive = [];
  let issuesToReset = [];

  for (let issue of activeIssues) {
    // TODO: greater or equal?
    if (currDate.getTime() > issue.expiry_time.getTime()) {
      // TODO: fix with the updated schema from

      // archive issue
      let currArchivedIssue = new ArchivedIssues({
        script_id: issue.script_id,
        name: issue.name,
        date_triggered: issue.date_triggered,
        date_expired: issue.expiry_time,
        repeat: issue.repeat,
        issue_target: issue.issue_target,
        target_hash: issue.target_hash,
        computed_strategies: issue.computed_strategies,
      });
      issuesToArchive.push(currArchivedIssue);

      // TODO: is this needed? if the old issues are being flushed after their timeframe, won't the new one just start again based on their triggers?
      // the code to create active issues only checks if there's an existing active issue for the script (not in archived issues)
      // create new issue if repeat is specified
      if (issue.repeat) {
        // TODO: this is pretty repetitive of just creating a new active issue. try to pull out.
        // get script to see timeframe
        let relevantScript = await MonitoredScripts.findOne({
          _id: issue.script_id,
        }).lean();

        if (relevantScript !== null) {
          // pre-processing: convert fields with string functions to actual functions
          relevantScript.strategies.forEach((currStrategy, index, arr) => {
            arr[index] = {
              name: currStrategy.name,
              description: currStrategy.description,
              strategy_function: new Function(
                `return ${currStrategy.strategy_function}`
              )(),
            };
          });

          // get relevant targets
          let refreshedOrgObjs = await getRefreshedObjsForTarget(
            issue.issue_target
          );

          // create and save new issue
          issuesToReset.push(
            createActiveIssue(
              issue.script_id,
              issue.name,
              issue.expiry_time,
              computeExpiryTimeForScript(
                issue.expiry_time,
                relevantScript.timeframe
              ),
              issue.repeat,
              issue.issue_target,
              issue.target_hash,
              await computeStrategies(
                refreshedOrgObjs,
                relevantScript.strategies
              )
            )
          );
        }
      }

      // delete old issue
      await ActiveIssues.deleteOne({ _id: issue._id });
    }
  }

  // save all and return them
  return await Promise.all([
    ArchivedIssues.insertMany(issuesToArchive),
    ActiveIssues.insertMany(issuesToReset),
  ]);
};

/**
 *
 * @param triggerDate
 * @param timeFrame
 * @return {Date}
 */
const computeExpiryTimeForScript = (triggerDate, timeFrame) => {
  let roundingCoeff = 1000 * 60 * 5;
  let roundedDate = new Date(
    Math.round(triggerDate.getTime() / roundingCoeff) * roundingCoeff
  );
  let expiryTime = new Date(roundedDate);

  // add time to roundedDate based on timeframe from script
  switch (timeFrame) {
    case 'day':
      expiryTime.setDate(expiryTime.getDate() + 1);
      break;
    case 'week':
      expiryTime.setDate(expiryTime.getDate() + 7);
      break;
    case 'month':
      expiryTime.setMonth(expiryTime.getMonth() + 1);
      break;
    case 'sprint':
      // TODO: this is incorrect
      expiryTime.setDate(expiryTime.getDate() + 14);
      break;
    case 'quarter':
      // TODO: this is incorrect
      expiryTime.setMonth(expiryTime.getMonth() + 3);
      break;
    default:
      break;
  }

  return expiryTime;
};

/**
 *
 * @param target
 * @param strategyList
 * @return {Promise<{outlet_fn: *, opportunity: *, message: *}[]>}
 */
const computeStrategies = async (target, strategyList) => {
  let computedStrategies = await executeStrategies(target, strategyList);
  return computedStrategies.map((currStrategy) => {
    currStrategy.outlet_fn = currStrategy.outlet_fn.toString();
    return currStrategy;
  });
};
