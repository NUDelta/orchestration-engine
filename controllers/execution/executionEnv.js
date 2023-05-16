import * as feedbackFns from '../programmingLanguage/feedbackFunctions.js';
import * as predicateFns from '../programmingLanguage/predicates.js';
import * as timeHelperFns from '../programmingLanguage/timeHelpers.js';
import * as studioFns from '../../imports/studioAPI/requests.js';

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
  /**
   * Creates a new instance of the ExecutionEnv class
   * @param orgObjs object values to include in the ExecutionEnv namespace.
   * @param scriptFn function script to run using targets of this class.
   */
  constructor(orgObjs, scriptFn) {
    function addToContext(obj, dest) {
      for (const key in obj) {
        dest[key] = obj[key];
      }
    }
    this.scriptFn = scriptFn;
    addToContext(orgObjs, this);
  }

  /**
   * Runs scriptFn using the targets and programming languages attached to the scope of the class.
   * @param args optional args tht can be passed to the scriptFn.
   * @returns {Promise<*>} promise that, when resolved, is the output of scriptFn.
   */
  async runScript(args = undefined) {
    let boundScriptToExecute = this.scriptFn.bind(this);
    return await boundScriptToExecute(args);
  }
}

// add programming language functions to the ExecutionEnv's prototype
const scriptingLanguageFns = {
  ...feedbackFns,
  ...predicateFns,
  ...timeHelperFns,
  ...studioFns,
};

for (const [key, value] of Object.entries(scriptingLanguageFns)) {
  ExecutionEnv.prototype[key] = value;
}
