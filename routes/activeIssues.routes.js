import { Router } from 'express';
import { createActiveIssue } from '../controllers/modelControllers/activeIssuesController.js';
import {
  computeApplicableSet,
  getRefreshedObjsForTarget,
} from '../controllers/execution/executionFns.js';
import { computeStrategies } from '../controllers/execution/executionFlow.js';
import { ActiveIssues } from '../models/activeIssues.js';
import { getFromStudioAPI } from '../imports/studioAPI/requests.js';

import hash from 'object-hash';
import mongoose from 'mongoose';

export const activeIssuesRouter = new Router();

// TODO: needs testing
/**
 * Creates a new ActiveIssue
 * request body: {
 *  scriptId: string,
 *  scriptName: string,
 *  dateTriggered: Date as string,
 *  expiryTime: Date as string,
 *  shouldRepeat: boolean,
 *  issueTarget: {
 *   targetType: string,
 *   name: string,
 *  },
 *  strategyToEnact: {
 *    name: string,
 *    description: string,
 *    strategy_function: string,
 *  }
 */
activeIssuesRouter.post('/createActiveIssue', async (req, res) => {
  try {
    // parse input from request body
    const {
      scriptId,
      scriptName,
      dateTriggered, // TODO: optionally allow
      expiryTime, // TODO: optionally allow
      shouldRepeat,
      issueTarget, // should be in the format of an applicable set target (man, typescript interfaces would be really nice here)
      strategyToEnact,
      updateIfExists = false,
    } = req.body;

    console.log(
      'In /createActiveIssue: strategiesToEnact code',
      strategyToEnact
    );

    // create an objectId based on the passed in scriptId
    let objIdForScript = mongoose.Types.ObjectId.createFromHexString(scriptId);

    // TODO: run code transformer to add this and async/await before saving script
    // convert strategy into a function
    const strategyAsFn = {
      name: strategyToEnact.name,
      description: strategyToEnact.description,
      strategy_function: new Function(
        `return ${strategyToEnact.strategy_function}`
      )(),
    };

    // compute applicable set for target
    // TODO: assumes target is a project for now
    let applicableSet = await computeApplicableSet(async function () {
      return this.projects.filter(this.where('name', [issueTarget.name]));
    });
    if (applicableSet.length === 0) {
      throw new Error('No applicable set was computed');
    }

    // compute strategy given the target and the script
    let refreshedOrgObjs = await getRefreshedObjsForTarget(applicableSet[0]);
    let computedStrategies = await computeStrategies(refreshedOrgObjs, [
      strategyAsFn,
    ]);

    // check if strategies were computed successfully
    if (computedStrategies.length === 0) {
      throw new Error('No strategies were computed');
    }

    const targetHash = hash({
      targetType: issueTarget.targetType,
      name: issueTarget.name,
    });

    // check to see if the script exists
    let foundIssue = await ActiveIssues.findOne({
      script_id: objIdForScript,
    });

    // if it does and we shouldn't update, return a 409 conflict
    if (foundIssue !== null && !updateIfExists) {
      const issueFoundMessage = `In createActiveIssue: script with id ${scriptId} already exists`;
      console.log(issueFoundMessage);

      // return a 409 conflict with server message
      res
        .status(409)
        .json({ error: issueFoundMessage, foundIssue: foundIssue });
      return;
    } else if (foundIssue !== null && updateIfExists) {
      console.log(
        `In createActiveIssue: script with id ${scriptId} already exists. updating it's value.`
      );

      // if we should update, update the existing issue
      foundIssue.name = scriptName;
      foundIssue.date_triggered = new Date(dateTriggered);
      foundIssue.expiry_time = new Date(expiryTime);
      foundIssue.repeat = shouldRepeat;
      foundIssue.issue_target = applicableSet[0];
      foundIssue.target_hash = targetHash;
      foundIssue.computed_strategies = computedStrategies;

      // save the updated issue
      const updatedIssue = await foundIssue.save();

      // return a successful response with the updated issue
      res.status(200).json({ activeIssue: updatedIssue });
      return;
    }

    // otherwise, create a new active issue
    const activeIssue = createActiveIssue(
      objIdForScript,
      scriptName,
      new Date(dateTriggered),
      new Date(expiryTime),
      shouldRepeat,
      applicableSet[0],
      targetHash,
      computedStrategies
    );
    const createdIssue = await activeIssue.save();

    // return a successful response with the created issue
    res.status(200).json({ activeIssue: createdIssue });
  } catch (error) {
    let errorMessage = `Error when creating ActiveIssue via API route: ${error.stack}`;
    console.error(errorMessage);

    // return a 400 error with the error message and stack
    res.status(400).json({ error: errorMessage, stack: error.stack });
  }
});

// TODO: implement
activeIssuesRouter.post('/updateActiveIssue', async (req, res) => {});

/**
 * Returns all active issues.
 * request body: {}
 * TODO: probably should have 1 fetch function with query params
 */
activeIssuesRouter.get('/fetchActiveIssues', async (req, res) => {
  try {
    const activeIssues = await ActiveIssues.find({});
    res.status(200).json(activeIssues);
  } catch (error) {
    let errorMessage = `Error when fetching all ActiveIssues via API route: ${error.stack}`;
    console.error(errorMessage);
    res.json(errorMessage);
  }
});

/**
 * Returns all active issues for a given project.
 * request query params: ?projectName=string
 * TODO: should allow filtering by venue
 */
activeIssuesRouter.get('/fetchActiveIssuesForProject', async (req, res) => {
  try {
    // get project name from query
    const { projectName } = req.query;

    // fetch all active issues for the project
    const activeIssues = await ActiveIssues.find({
      'issue_target.name': projectName,
    });
    res.status(200).json(activeIssues);
  } catch (error) {
    let errorMessage = `Error when fetching all ActiveIssues via API route: ${error.stack}`;
    console.error(errorMessage);
    res.json(errorMessage);
  }
});

/**
 * Returns all active issues for a given SIG.
 * request query params: ?sigName=string
 * TODO: should allow filtering by venue
 */
activeIssuesRouter.get('/fetchActiveIssuesForSig', async (req, res) => {
  try {
    // get SIG name from query
    const { sigName } = req.query;

    // get all projects for the SIG from the Studio API
    const response = await getFromStudioAPI('projects', {
      populateTools: false,
    });
    const projectsForSig = response.body.filter((project) => {
      return project.sig_name === sigName;
    });
    const projectNames = projectsForSig.map((project) => project.name);

    // fetch all active issues for the list of projects
    const activeIssues = await ActiveIssues.find({
      'issue_target.name': {
        $in: projectNames,
      },
    });
    res.status(200).json(activeIssues);
  } catch (error) {
    let errorMessage = `Error when fetching all ActiveIssues via API route: ${error.stack}`;
    console.error(errorMessage);
    res.json(errorMessage);
  }
});
