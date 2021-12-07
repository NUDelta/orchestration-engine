import { OrchestrationScript } from "../scriptLibrary.js";
import mongoose from "mongoose";

// TODO:  functions to try
// (1) KG: prototyping process (with multiple triggers that go off) [implemented]
// (2) KG: remind me to check on my student's meta-blockers at the end of each sprint (recurring check-ins throughout the quarter)
// (3) HQ: discuss effective working structures with students (manual triggering, but allow the trigger to inject what templates should be sent for each student [e.g., for a student working on a prospectus, the design argument])
// (4) HK: student behind on their sprint AND close to office hours (more specificity on when the situation should trigger -- currently only if some data condition is met)
// (5) RL: not bringing in-progress work to venues where it can be worked on or discussed further (check-in between venues -- requires being able to trigger scripts a certain time before venues happen)
const createScripts = async () => {
  // TODO: add a static object id that I can reference in testing
  const prototypingScript = new OrchestrationScript({
    _id: mongoose.Types.ObjectId("61af17954cfa9c626adcb2aa"),
    name: "Prototyping slices w/testing each week",
    description: "When students plan to do prototyping, they should aim to do a slice where they (1) draft arguments; (2) make the prototype; (3) conduct a user test; and (4) do takeaways from user testing to update their arguments.",
    // TODO: this could also be function, where you can get things like new students at runtime
    target: {
      students: ["Jason Friedman", "Hang Yin"], // getStudentsForSIG("SIG NAME"); alt: function () { return ["jason", "hang"] }
      projects: ["Orchestration Scripting Environments"]
    },
    detector: (async function () { return await hasPrototypeTask(await getTasksForSprint()); }).toString(),
    actionable_feedback: [
      {
        feedback_message: "Looks like you have prototyping planned for this sprint. During SIG, let's talk about your plan for the week and make sure you'll get testing in before next SIG.",
        feedback_opportunity: (async function () { return await during(await venue("SIG")); }).toString()
      },
      {
        feedback_message: "How is your prototyping sprint going? Are you on track to have testing done and takeaways before SIG? What can you do during Pair Research and Mysore in Studio to help move you in the right direction?",
        feedback_opportunity: (async function () { return await during(await venue("Studio")); }).toString()
      }
    ]
  });
  await prototypingScript.save();

  const workingRepresentationsTemplateScript = new OrchestrationScript({
    _id: mongoose.Types.ObjectId("61af2faea7f373281094b277"),
    name: "Using appropriate representations when working on deliverables",
    description: "When students are working on tasks that we have good representations for (e.g., design arguments), have them use the representation as part of their working process when doing their deliverables.",
    target: {},
    detector: (async function () { return true; }).toString(), // trigger script immediately in engine
    actionable_feedback: []
  });
  await workingRepresentationsTemplateScript.save();
};

export const createScriptLibraryFixtures = async () => {
  // clear out the script library
  await OrchestrationScript.deleteMany({}).exec();

  // populate scripts
  await createScripts();
}