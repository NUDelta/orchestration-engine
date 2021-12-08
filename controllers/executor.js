import * as sprintLogFn from './lib/sprintLogFn.js';
import * as venueFn from './lib/venueFn.js';
import * as triggerFn from './lib/triggerFn.js';
import * as communicationFn from './lib/communicationFn.js';
import * as peopleFn from './lib/peopleFn.js';

const scriptingLanguageFns = {
  ...sprintLogFn,
  ...venueFn,
  ...triggerFn,
  ...communicationFn,
  ...peopleFn
};

/**
 * Creates an execution namespace to run detectors/triggers from orchestration scripts.
 *
 * Namespace imports in the script, targets on which to run the scripts, and script functions
 * from the
 * @param scriptFn
 * @param targets
 * @param languageFns
 * @return {*}
 */
export async function executionEnv(scriptFn, targets, languageFns) {
  /**
   * Adds objects to an execution context.
   * In this function, it is used to add the parameters to globalThis.
   * @param obj
   * @param dest
   */
  function addToContext(obj, dest) {
    for (const key in obj) {
      dest[key] = obj[key];
    }
  }

  // add targets and language functions to this context
  addToContext(targets, globalThis);
  addToContext(languageFns, globalThis);

  return await scriptFn();
}

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

  return await executionEnv(scriptFn, targets, scriptingLanguageFns);
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

    // create object to hold curr computed feedback opportunity
    let computedFeedbackOpportunity = {
      trigger_date: await executionEnv(currActionableFeedback.feedback_opportunity,
        targets, scriptingLanguageFns),
      feedback_message: currActionableFeedback.feedback_message,
      feedback_outlets: await executionEnv(currActionableFeedback.feedback_outlet, targets, scriptingLanguageFns)
    };

    // store trigger date
    computedFeedbackOpportunities.push(computedFeedbackOpportunity);
  }

  return computedFeedbackOpportunities;
}
