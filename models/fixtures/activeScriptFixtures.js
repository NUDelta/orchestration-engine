import { ActiveScripts } from "../activeScripts.js";
import { OrchestrationScript } from "../scriptLibrary.js";

const populateActiveScripts = async () => {
  let scriptsToActiveIds = [
    "61af17954cfa9c626adcb2aa"
  ];

  for (let currScriptId of scriptsToActiveIds) {
    // get the template script from the script library
    let templateScript = await OrchestrationScript.findOne({ _id: currScriptId });
    templateScript = templateScript.toObject();
    templateScript["script_id"] = templateScript._id;
    delete templateScript._id
    delete templateScript.__v

    let newActiveScript = new ActiveScripts(templateScript);
    await newActiveScript.save();
  }
};

export const createActiveScriptFixtures = async () => {
  // clear out active scripts
  await ActiveScripts.deleteMany({}).exec();

  // populate active scripts
  await populateActiveScripts();
};