// TODO: need to catch errors if things fail
import { floorDateToNearestFiveMinutes } from "../../imports/utils.js";
import { ExecutionEnv } from "./executionEnv.js";

/**
 * Computes the targets specified by the target function in the orchestration script.
 * @param targetFn function that specifies targets.
 * @return {Promise<*>}
 */
export async function computeTargets(targetFn) {
  // TODO: this should load in all the projects, students, sigs, etc. before createing the execution env

  // generate targets
  let targetExecEnv = new ExecutionEnv({}, targetFn);
  return await targetExecEnv.runScript();
}

// TODO: there needs to be one layer of abstraction higher where you iterate over all
// all the targets once the functions are being used to compute them.
// Then for each target that the script triggers for, save it out as an issue that later parts of
// the code will use.

// TODO: need to catch errors if things fail
/**
 * Used to run detector condition for an orchestration script.
 * @param target { students: [string], target: "string" }
 * @param detector function
 * @return {Promise<*>}
 */
export async function runDetector(target, detector) {
  // create script execution environment and run script
  let scriptExecutionEnv = new ExecutionEnv(target, detector);
  return await scriptExecutionEnv.runScript();
}

/**
 * Used to run trigger function for actionable feedback in orchestration scripts.
 * @param target { students: [string], target: "string" }
 * @param actionableFeedback list of feedback opportunities.
 * @return {Promise<*[]>}
 */
export async function getFeedbackOpportunity(target, actionableFeedback) {
  // compute when each feedback opportunity should be executed
  let computedFeedbackOpportunities = [];
  for (let feedbackItemIndex in actionableFeedback) {
    // get current feedback opportunity
    let currActionableFeedback = actionableFeedback[feedbackItemIndex];

    // TODO: make sure this is using all the target information from when(...)
    // create execution envs for computing trigger date and feedback outlets
    let triggerDateExecutionEnv = new ExecutionEnv(target,
      currActionableFeedback.feedback_opportunity);

    // get opportunity date, and floor
    let opportunityDate = await triggerDateExecutionEnv.runScript();

    // create object to hold curr computed feedback opportunity
    let computedFeedbackOpportunity = {
      opportunity: floorDateToNearestFiveMinutes(opportunityDate),
      target: {
        message: currActionableFeedback.feedback_message,
        resources: [], // TODO, implement
        ...target
      },
      outlet_fn: currActionableFeedback.feedback_outlet
    };

    // store trigger date
    computedFeedbackOpportunities.push(computedFeedbackOpportunity);
  }

  return computedFeedbackOpportunities;
}
