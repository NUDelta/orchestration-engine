/**
 * This file contains functions to execute the monitoring of scripts, creation of issues,
 * and delivery of feedback.
 */
import { MonitoredScripts } from "../models/monitoredScripts.js";
import { ActiveIssues } from "../models/activeIssues.js";
import { ArchivedIssues } from "../models/archivedIssues.js";

import { computeTargets, runDetector, getFeedbackOpportunity, ExecutionEnv } from "./executor.js";
import { floorDateToNearestFiveMinutes } from "../imports/utils.js";

/**
 * TODO: comment
 * @return {Promise<Array<EnforceDocument<T & Document<any, any, any>, {}, {}>>>}
 */
export const checkMonitoredScripts = async () => {
  // store current date to use for created issues
  let currDate = floorDateToNearestFiveMinutes(new Date());

  // fetch all monitored scripts
  let monitoredScripts = await MonitoredScripts.find({});

  // for each script, check script condition and create an issue if triggered
  let generatedIssues = [];
  for (let currScript of monitoredScripts) {
    // parse current script
    currScript = currScript.toObject();

    currScript["target"] = new Function(`return ${ currScript["target"] }`)();
    currScript["detector"] = new Function(`return ${ currScript["detector"] }`)();
    currScript["actionable_feedback"].forEach((currActionableFeedback, index, arr) => {
      arr[index] = {
        feedback_message: currActionableFeedback["feedback_message"],
        feedback_opportunity: new Function(`return ${ currActionableFeedback["feedback_opportunity"] }`)(),
        feedback_outlet: new Function(`return ${ currActionableFeedback["feedback_outlet"] }`)()
      }
    });

    // TODO: computeTargets(...) will need to have the projects, students, sigs, etc. objects accessible
    // generate targets for script
    let computedTargets = await computeTargets(currScript.target);

    // run detector for each target, and create issues for each target-detector pair that is true
    for (const currTarget of computedTargets) {
      let scriptDidTrigger = await runDetector(currTarget, currScript.detector);

      // store triggered scripts as issues
      if (scriptDidTrigger) {
        // check if issue already exists in database
        let foundIssue = await ActiveIssues.findOne({
          script_id: currScript._id,
          students: {
            $in: currTarget.students
          },
          project: currTarget.project
        }).exec();

        if (foundIssue === null) {
          // issue not in DB, add it
          generatedIssues.push(new ActiveIssues({
            script_id: currScript._id,
            name: currScript.name,
            date_triggered: currDate,
            expiry_time: computeExpiryTimeForScript(currDate, currScript.timeframe),
            repeat: currScript.repeat,
            students: currTarget.students,
            project: currTarget.project,
            detector: currScript.detector.toString(),
            computed_actionable_feedback: await computeActionableFeedback(currTarget, currScript.actionable_feedback)
          }));
        }
      }
    }
  }

  return ActiveIssues.insertMany(generatedIssues);
}


/**
 * Checks if any active issues should have their feedback triggered, and executes those feedback.
 * @return {Promise<*[]>}
 */
export const checkActiveIssues = async () => {
  // get all issues
  let activeIssues = await ActiveIssues.find({});

  // hold date for checking all of these issues
  let currDate = floorDateToNearestFiveMinutes(new Date());

  // for each issue, check if any of the feedback opportunities should trigger
  let triggeredFeedbackOpps = [];
  for (const issue of activeIssues) {
    let issueObj = issue.toObject();

    // check each feedback opportunity
    for (const feedbackOpp of issueObj.computed_actionable_feedback) {
      // convert outlet fn back to a function
      feedbackOpp["outlet_fn"] = new Function(`return ${ feedbackOpp["outlet_fn"] }`)();

      // TODO: this will fail since its looking for a direct match. Need to round this down.
      // TODO: in the future, may want to change it to currTime >= oppTime (or on the same day, but >= time). This will need to check, though, if a ping has been sent for an active issue.
      // check if it's time to send the actionable feedback
      if (currDate.getTime() === feedbackOpp.opportunity.getTime()) {
        // execute feedback function by creating an execution env with targets and outlet_fn
        let feedbackExecutionEnv = new ExecutionEnv(feedbackOpp.target, feedbackOpp.outlet_fn);
        await feedbackExecutionEnv.runScript();

        // add to triggered feedback list
        triggeredFeedbackOpps.push({
          name: issueObj.name,
          target: {
            students: issueObj.students,
            project: issueObj.project
          },
          message: feedbackOpp.target.message
        });
      }
    }
  }

  return triggeredFeedbackOpps;
};

/**
 * Checks if any active issues should be archived or reset.
 * @return {Promise<unknown[]>}
 */
export const cleanUpActiveIssues = async () => {
  // get all issues
  let activeIssues = await ActiveIssues.find({});

  // for each issue, check to see if we're past the expiry time
  let currDate = floorDateToNearestFiveMinutes(new Date());

  let issuesToArchive = [];
  let issuesToReset = [];

  for (let issue of activeIssues) {
    issue = issue.toObject();
    // TODO: greater or equal?
    if (currDate.getTime() > issue.expiry_time.getTime()) {
      // archive issue
      let currArchivedIssue = new ArchivedIssues({
        script_id: issue.script_id,
        name: issue.name,
        date_triggered: issue.date_triggered,
        date_expired: issue.expiry_time,
        repeat: issue.repeat,
        target: {
          students: issue.students,
          project: issue.project
        },
        detector: issue.detector,
        computed_actionable_feedback: issue.computed_actionable_feedback
      });
      issuesToArchive.push(currArchivedIssue);

      // create new issue if repeat is specified
      if (issue.repeat) {
        // TODO: this is pretty repetitive of just creating a new active issue. try to pull out.
        // get script to see timeframe
        let relevantScript = await MonitoredScripts.findOne({ _id: issue.script_id });

        if (relevantScript !== null) {
          relevantScript = relevantScript.toObject();
          relevantScript["actionable_feedback"].forEach((currActionableFeedback, index, arr) => {
            arr[index] = {
              feedback_message: currActionableFeedback["feedback_message"],
              feedback_opportunity: new Function(`return ${ currActionableFeedback["feedback_opportunity"] }`)(),
              feedback_outlet: new Function(`return ${ currActionableFeedback["feedback_outlet"] }`)()
            }
          });

          // create new issue
          let repeatedActiveIssue = new ActiveIssues({
            script_id: issue.script_id,
            name: issue.name,
            date_triggered: issue.expiry_time,
            expiry_time: computeExpiryTimeForScript(issue.expiry_time, relevantScript.timeframe),
            repeat: issue.repeat,
            students: issue.students,
            project: issue.project,
            detector: issue.detector.toString(),
            computed_actionable_feedback: await computeActionableFeedback({
              students: issue.students,
              project: issue.project
            }, relevantScript.actionable_feedback)
          });
          issuesToReset.push(repeatedActiveIssue);
        }
      }

      // delete old issue
      await ActiveIssues.deleteOne({ _id: issue._id });
    }
  }

  // save all and return them
  return [
    await ArchivedIssues.insertMany(issuesToArchive),
    await ActiveIssues.insertMany(issuesToReset)
  ];
};

/**
 *
 * @param triggerDate
 * @param timeFrame
 * @return {Date}
 */
const computeExpiryTimeForScript = (triggerDate, timeFrame) => {
  let roundingCoeff = 1000 * 60 * 5;
  let roundedDate = new Date(Math.round(triggerDate.getTime() / roundingCoeff) * roundingCoeff);
  let expiryTime = new Date(roundedDate);

  // add time to roundedDate based on timeframe from script
  switch (timeFrame) {
    case "day":
      expiryTime.setDate(expiryTime.getDate() + 1);
      break;
    case "week":
      expiryTime.setDate(expiryTime.getDate() + 7);
      break;
    case "month":
      expiryTime.setMonth(expiryTime.getMonth() + 1);
      break;
    case "sprint":
      // TODO: this is incorrect
      expiryTime.setDate(expiryTime.getDate() + 14);
      break;
    case "quarter":
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
 * @param actionableFeedbackList
 * @return {Promise<{outlet_fn: *, opportunity: *, message: *}[]>}
 */
const computeActionableFeedback = async (target, actionableFeedbackList) => {
  let computedFeedback = await getFeedbackOpportunity(target, actionableFeedbackList);
  return computedFeedback.map((currFeedback) => {
    currFeedback.outlet_fn = currFeedback.outlet_fn.toString()
    return currFeedback;
  });
};