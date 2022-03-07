import { MonitoredScripts } from "../monitoredScripts.js";
import { OrchestrationScript } from "../scriptLibrary.js";
import { ActiveIssues } from "../activeIssues.js";
import { ArchivedIssues } from "../archivedIssues.js";

const populateActiveScripts = async () => {
  let scriptsToActivateNames = [
    "Scoping Research Sprints",
    "Fully planning sprints",
    "Sending updated sprints after SIG",
    "Reminder for Status Update",
    "Have students read EOQ checklist before last SIG",
    "Discuss EOQ deliverables during SIG"
  ];

  for (let currScriptName of scriptsToActivateNames) {
    // get the template script from the script library
    let templateScript = await OrchestrationScript.findOne({ name: currScriptName });
    templateScript = templateScript.toObject();
    templateScript["script_id"] = templateScript._id;
    delete templateScript._id
    delete templateScript.__v

    let newActiveScript = new MonitoredScripts(templateScript);
    await newActiveScript.save();
  }
};

export const createActiveScriptFixtures = async () => {
  // clear out active scripts
  await MonitoredScripts.deleteMany({}).exec();

  // clear out active issues
  await ActiveIssues.deleteMany({}).exec();

  // clear out archived issues
  await ArchivedIssues.deleteMany({}).exec();

  // populate active scripts
  await populateActiveScripts();
};

export const isMonitoredScriptsEmpty = async () => {
  let foundMonitoredScripts = await MonitoredScripts.find({});
  return foundMonitoredScripts.length === 0;
};