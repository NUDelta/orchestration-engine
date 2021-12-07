import { ActiveScripts } from "../activeScripts.js";
import { OrchestrationScript } from "../scriptLibrary.js";

const populateActiveScripts = async () => {
  let scriptsToActiveIds = [
    "61af17954cfa9c626adcb2aa"
  ];

  for (let currScriptId of scriptsToActiveIds) {
    let currActiveScript = new ActiveScripts({
      orchestration_script: currScriptId
    });
    await currActiveScript.save();
  }
};

export const createActiveScriptFixtures = async () => {
  // clear out active scripts
  await ActiveScripts.deleteMany({}).exec();

  // populate active scripts
  await populateActiveScripts();
};