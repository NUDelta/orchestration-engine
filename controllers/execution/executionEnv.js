import * as feedbackFns from "../programmingLanguage/feedbackFunctions.js";
import * as predicateFns from "../programmingLanguage/predicates.js";
import * as timeHelperFns from "../programmingLanguage/timeHelpers.js";

/**
 * Class that provides an execution environment where detectors and feedback functions in scripts
 * can run.
 *
 * The environment provides targets on the "this" context, and programming language functions on the
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
  ...feedbackFns,
  ...predicateFns,
  ...timeHelperFns
};

for (const [key, value] of Object.entries(scriptingLanguageFns)) {
  ExecutionEnv.prototype[key] = value;
}