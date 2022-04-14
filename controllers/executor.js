import * as scriptTargetFn from "./lib/scriptTargetFn.js";
import * as sprintLogFn from './lib/sprintLogFn.js';
import * as venueFn from './lib/venueFn.js';
import * as triggerFn from './lib/triggerFn.js';
import * as communicationFn from './lib/communicationFn.js';
import * as peopleFn from './lib/peopleFn.js';
import * as projectFn from "./lib/projectFn.js";

// TODO: target should be a single object with student and project (see issue 1)
/**
 * Class that provides an execution environment where detectors and feedback functions in scripts
 * can run.
 *
 * The environment provides targets on the this context, and programming language functions on the
 * object's prototype. As a caveat, all programming languages functions used in an orchestration
 * script must be pre-pended with "this." so that they refer to the functions in the environment's
 * prototype.
 */
export class ExecutionEnv {
  constructor(targets, scriptFn) {
    function addToContext(obj, dest) {
      for (const key in obj) {
        dest[key] = obj[key];
      }
    }
    this.scriptFn = scriptFn;
    addToContext(targets, this);
  }

  async runScript() {
    let boundScriptToExecute = this.scriptFn.bind(this);
    return await boundScriptToExecute();
  }
}

// add programming language functions to the execution env's prototype
const scriptingLanguageFns = {
  ...scriptTargetFn,
  ...sprintLogFn,
  ...venueFn,
  ...triggerFn,
  ...communicationFn,
  ...peopleFn,
  ...projectFn
};

for (const [key, value] of Object.entries(scriptingLanguageFns)) {
  ExecutionEnv.prototype[key] = value;
}

// TODO: need to catch errors if things fail
/**
 * Computes the targets specified by the target function in the orchestration script.
 * @param targetFn function that specifies targets.
 * @return {Promise<*>}
 */
export async function computeTargets(targetFn) {
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

    // create execution envs for computing trigger date and feedback outlets
    let triggerDateExecutionEnv = new ExecutionEnv(target,
      currActionableFeedback.feedback_opportunity);

    // TODO: opportunity timestamp should also be rounded to the nearest 5 mins
    // create object to hold curr computed feedback opportunity
    let computedFeedbackOpportunity = {
      opportunity: await triggerDateExecutionEnv.runScript(),
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
