import { Router } from 'express';
import { createActiveIssue } from '../controllers/modelControllers/activeIssuesController.js';
import { getRefreshedObjsForTarget } from '../controllers/execution/executionFns.js';
import { computeStrategies } from '../controllers/execution/executionFlow.js';

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
    } = req.body;

    // TODO: run code transformer to add this and async/await before saving script
    // convert strategy into a function
    const strategyAsFn = {
      name: strategyToEnact.name,
      description: strategyToEnact.description,
      strategy_function: new Function(
        `return ${strategyToEnact.strategy_function}`
      )(),
    };

    // compute strategy given the target and the script
    let refreshedOrgObjs = await getRefreshedObjsForTarget(issueTarget);
    let computedStrategies = await computeStrategies(refreshedOrgObjs, [
      strategyAsFn,
    ]);
    const targetHash = hash({
      targetType: issueTarget.targetType,
      name: issueTarget.name,
    });

    // create the active issue
    const activeIssue = createActiveIssue(
      scriptId,
      scriptName,
      new Date(dateTriggered),
      new Date(expiryTime),
      shouldRepeat,
      issueTarget,
      targetHash,
      computedStrategies
    );
    const createdIssue = await activeIssue.save();

    // return a successful response with the created issue
    res.status(200).json(createdIssue);
  } catch (error) {
    let errorMessage = `Error when creating ActiveIssue via API route: ${error.stack}`;
    console.error(errorMessage);
    res.send(errorMessage);
  }
});

// TODO: implement
activeIssuesRouter.post('/updateActiveIssue', async (req, res) => {});
