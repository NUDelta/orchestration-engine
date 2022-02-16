import { ActiveScripts } from "../activeScripts.js";
import { OrchestrationScript } from "../scriptLibrary.js";

const populateActiveScripts = async () => {
  let scriptsToActiveIds = [
    "72af28054cfa9c626adcb2aa",
    "61af17044cfa9c626adcb2aa"
    // "61af17954cfa9c626adcb2aa",
    // "61b01b296866d1560544b81b",
    // "61b01c93abe4a4ea27794106"
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