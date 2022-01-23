import * as sprintLogFn from './lib/sprintLogFn.js';
import * as venueFn from './lib/venueFn.js';
import * as triggerFn from './lib/triggerFn.js';
import * as communicationFn from './lib/communicationFn.js';
import * as peopleFn from './lib/peopleFn.js';

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
  ...sprintLogFn,
  ...venueFn,
  ...triggerFn,
  ...communicationFn,
  ...peopleFn
};

for (const [key, value] of Object.entries(scriptingLanguageFns)) {
  ExecutionEnv.prototype[key] = value;
}

// TODO: there needs to be one layer of abstraction higher where you iterate over all
// all the targets once the functions are being used to compute them.
// Then for each target that the script triggers for, save it out as an issue that later parts of
// the code will use.
/**
 * Used to run detector condition for an orchestration script.
 * @param orchScript
 */
export async function runDetector(orchScript) {
  // separate out components
  const scriptFn = orchScript.detector;
  const targets = {
    students: orchScript.target.students,
    projects: orchScript.target.projects,
  };

  // create script execution environment and run script
  let scriptExecutionEnv = new ExecutionEnv(targets, scriptFn);
  return await scriptExecutionEnv.runScript();
}

// TODO: this will only trigger once since it returns (should pass in only 1 actionable feedback)
/**
 * Used to run trigger function for actionable feedback in orchestration scripts.
 * @param orchScript
 */
export async function getFeedbackOpportunity(orchScript) {
  // separate out components
  const targets = {
    students: orchScript.target.students,
    projects: orchScript.target.projects,
  };

  // compute when each feedback opportunity should be executed
  let computedFeedbackOpportunities = [];
  for (let feedbackItemIndex in orchScript.actionable_feedback) {
    // get current feedback opportunity
    let currActionableFeedback = orchScript.actionable_feedback[feedbackItemIndex];

    // create execution envs for computing trigger date and feedback outlets
    let triggerDateExecutionEnv = new ExecutionEnv(targets,
      currActionableFeedback.feedback_opportunity);
    let feedbackOutletExecutionEnv = new ExecutionEnv(targets,
      currActionableFeedback.feedback_outlet);

    // create object to hold curr computed feedback opportunity
    let computedFeedbackOpportunity = {
      trigger_date: await triggerDateExecutionEnv.runScript(),
      feedback_message: currActionableFeedback.feedback_message,
      feedback_outlets: await feedbackOutletExecutionEnv.runScript()
    };

    // store trigger date
    computedFeedbackOpportunities.push(computedFeedbackOpportunity);
  }

  return computedFeedbackOpportunities;
}
