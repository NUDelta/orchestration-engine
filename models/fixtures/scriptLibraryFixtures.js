import { OrchestrationScript } from "../scriptLibrary.js";

import remindStudentAboutStatusUpdate from "./exampleScriptFixtures/remindStudentAboutStatusUpdate.js";
import readThroughEOQChecklist from "./exampleScriptFixtures/readThroughEOQChecklist.js";
import discussEOQDeliverablesAtSig from "./exampleScriptFixtures/discussEOQDeliverablesAtSig.js";
import sprintUnderPoints from "./exampleScriptFixtures/undercommittedOnSprint.js";
import sprintOverPoints from "./exampleScriptFixtures/overcommittedOnSprint.js";
import usingVenuesThroughoutWeek from "./exampleScriptFixtures/usingVenuesThroughoutWeek.js";
import usingVenuesThroughoutWeekJonathan
  from "./exampleScriptFixtures/usingVenuesThroughoutWeekJonathan.js";
import researchProgressForPhdStudents
  from "./exampleScriptFixtures/researchProgressForPhdStudents.js";
import compassInActionCues from "./exampleScriptFixtures/compassInActionCues.js";

/**
 * Creates orchestration scripts documents and saves them to the script_library collection.
 * @return {Promise<void>}
 */
const createScripts = async () => {
  let scriptsToAdd = [
    new OrchestrationScript(remindStudentAboutStatusUpdate),
    new OrchestrationScript(readThroughEOQChecklist),
    new OrchestrationScript(discussEOQDeliverablesAtSig),
    new OrchestrationScript(sprintUnderPoints),
    new OrchestrationScript(sprintOverPoints),
    new OrchestrationScript(usingVenuesThroughoutWeek),
    new OrchestrationScript(usingVenuesThroughoutWeekJonathan),
    new OrchestrationScript(researchProgressForPhdStudents),
    new OrchestrationScript(compassInActionCues),
  ];

  // check if script is already in the database, by name
  for (let script of scriptsToAdd) {
    let relevantScript = await OrchestrationScript.findOne({ name: script.name });
    if (relevantScript === null) {
      // no script found, so add it
      await script.save();
    }
  }
};

/**
 * Creates documents in the ScriptLibrary collection corresponding to Orchestration Scripts.
 * @param shouldEmpty optional boolean on whether the collection should be cleared first.
 * @returns {Promise<void>}
 */
export const createScriptLibraryFixtures = async (shouldEmpty=false) => {
   // clear out collections if specified
  if (shouldEmpty) {
    // clear out the script library
    await OrchestrationScript.deleteMany({}).exec();
  }

  // populate scripts
  await createScripts();
};

/**
 * Checks to see if the ScriptLibrary collection is empty.
 * @returns {Promise<boolean>} promise that, if resolved, returns true if ScriptLibrary is empty.
 */
export const isScriptLibraryEmpty = async () => {
  let foundScripts = await OrchestrationScript.find({});
  return foundScripts.length === 0;
};