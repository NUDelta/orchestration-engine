import { MonitoredScripts } from "../monitoredScripts.js";
import { OrchestrationScript } from "../scriptLibrary.js";
import { ActiveIssues } from "../activeIssues.js";
import { ArchivedIssues } from "../archivedIssues.js";

const populateActiveScripts = async () => {
  let scriptsToActivateNames = [
    "Support students in planning a Status Update for their project",
    // "Preparing for EOQ deliverables by reading through checklist",
    // "Planning and scoping end-of-quarter deliverables",
    "Fully planning sprints",
    "Scoping sprint plans to time constraints",
    "Using venues throughout the week for progressing research work",
    "Research progress for Ph.D. students",
  ];

  for (let currScriptName of scriptsToActivateNames) {
    // check if there is already an MonitoredScripts for currScriptName
    let relevantScript = await MonitoredScripts.findOne({ name: currScriptName });

    // if no script found, add it
    if (relevantScript === null) {
      // get the template script from the script library
      let templateScript = await OrchestrationScript.findOne({ name: currScriptName }).lean();
      templateScript["script_id"] = templateScript._id;
      delete templateScript._id
      delete templateScript.__v

      let newActiveScript = new MonitoredScripts(templateScript);
      await newActiveScript.save();
    }
  }
};

/**
 * Creates documents in the MonitoredScripts collection.
 * @param shouldEmpty
 * @returns {Promise<void>}
 */
export const createActiveScriptFixtures = async (shouldEmpty=false) => {
  // clear out collections if specified
  if (shouldEmpty) {
    // clear out active scripts
    await MonitoredScripts.deleteMany({}).exec();

    // clear out active issues
    await ActiveIssues.deleteMany({}).exec();

    // clear out archived issues
    await ArchivedIssues.deleteMany({}).exec();
  }

  // populate active scripts
  await populateActiveScripts();
};

export const isMonitoredScriptsEmpty = async () => {
  let foundMonitoredScripts = await MonitoredScripts.find({});
  return foundMonitoredScripts.length === 0;
};