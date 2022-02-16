import { OrchestrationScript } from "../scriptLibrary.js";
import mongoose from "mongoose";

/*
 Scripts to implement.
  (1) KG: prototyping process (with multiple triggers that go off) [implemented]
  (2) KG: remind me to check on my student's meta-blockers at the end of each sprint (recurring check-ins throughout the quarter)
  (3) HQ: discuss effective working structures with students (manual triggering, but allow the trigger to inject what templates should be sent for each student [e.g., for a student working on a prospectus, the design argument])
  (4) HK: student behind on their sprint AND close to office hours (more specificity on when the situation should trigger -- currently only if some data condition is met)
  (5) RL: not bringing in-progress work to venues where it can be worked on or discussed further (check-in between venues -- requires being able to trigger scripts a certain time before venues happen)
 */

/**
 * Creates orchestration scripts documents and saves them to the script_library collection.
 * @return {Promise<void>}
 */
const createScripts = async () => {
  // (1) KG: prototyping process (with multiple triggers that go off) [implemented]
  // const prototypingScript = new OrchestrationScript({
  //   _id: mongoose.Types.ObjectId("61af17954cfa9c626adcb2aa"),
  //   name: "Prototyping slices w/testing each week",
  //   description: "When students plan to do prototyping, they should aim to do a slice where they (1) draft arguments; (2) make the prototype; (3) conduct a user test; and (4) do takeaways from user testing to update their arguments.",
  //   // TODO: this could also be function, where you can get things like new students at runtime
  //   target: {
  //     students: ["Jason Friedman", "Hang Yin"], // getStudentsForSIG("SIG NAME"); alt: function () { return ["jason", "hang"] }
  //     projects: ["Orchestration Scripting Environments"]
  //   },
  //   //TODO: support specifying a time when the script should start monitoring (such as at the start of a SIG)
  //   detector: (async function () { return await this.hasPrototypeTask(await this.getTasksForSprint()); }).toString(),
  //   actionable_feedback: [
  //     {
  //       feedback_message: "Looks like you have prototyping planned for this sprint. During SIG, let's talk about your plan for the week and make sure you'll get testing in before next SIG.",
  //       feedback_opportunity: (async function () { return await this.during(await this.venue("SIG")); }).toString(),
  //       feedback_outlet: (async function () { return await this.getSlackChannelForProject(); }).toString()
  //     },
  //     {
  //       feedback_message: "How is your prototyping sprint going? Are you on track to have testing done and takeaways before SIG? What can you do during Pair Research and Mysore in Studio later today to help move you in the right direction?",
  //       feedback_opportunity: (async function () { return await this.before(await this.venue("Studio"), { hours: 3, minutes: 0, seconds: 0 }); }).toString(),
  //       feedback_outlet: (async function () { return await this.getSlackChannelForProject(); }).toString()
  //     },
  //     {
  //       feedback_message: "During Studio, it might be a good time to check in with your students on how their prototyping sprint is going, what they plan to use Mysore and Pair Research for, and if they need any help.",
  //       feedback_opportunity: (async function () { return await this.during(await this.venue("Studio")); }).toString(),
  //       feedback_outlet: (async function () { return await this.getSlackIdForPerson(await this.getSigHeadForProject()); }).toString()
  //     },
  //     {
  //       feedback_message: "For office hours later today, what would helpful to discuss about your prototyping slice? Your testing plan? Some early findings from your tests? Planning until our SIG meeting?",
  //       feedback_opportunity: (async function () { return await this.before(await this.venue("Office Hours"), { hours: 5, minutes: 0, seconds: 0 }); }).toString(),
  //       feedback_outlet: (async function () { return await this.getSlackChannelForProject(); }).toString()
  //     }
  //   ]
  // });
  // await prototypingScript.save();

  // // (3) HQ: discuss effective working structures with students (manual triggering, but allow the trigger to inject what templates should be sent for each student [e.g., for a student working on a prospectus, the design argument])
  // const workingRepresentationsTemplateScript = new OrchestrationScript({
  //   _id: mongoose.Types.ObjectId("61af2faea7f373281094b277"),
  //   name: "Using appropriate representations when working on deliverables",
  //   description: "When students are working on tasks that we have good representations for (e.g., design arguments), have them use the representation as part of their working process when doing their deliverables.",
  //   target: {},
  //   detector: (async function () { return true; }).toString(), // trigger script immediately in engine
  //   actionable_feedback: []
  // });
  // await workingRepresentationsTemplateScript.save();
  //
  // // (5) RL: not bringing in-progress work to venues where it can be worked on or discussed further (check-in between venues -- requires being able to trigger scripts a certain time before venues happen)
  // const comingToOhScriptArs = new OrchestrationScript({
  //   _id: mongoose.Types.ObjectId("61b01b296866d1560544b81b"),
  //   name: "Using venues throughout the week",
  //   description: "Use venues throughout the week to get feedback on in-progress work.",
  //   target: {
  //     students: ["Aimee van den Berg", "Ariella Silver", "Neha Sharma", "Molly Pribble"],
  //     projects: ["Skill Tracking and Development", "Metacognitive Reflection"]
  //   },
  //   detector: (async function () { return true; }).toString(), // trigger script immediately in engine
  //   actionable_feedback: [
  //     {
  //       feedback_message: "We have office hours mysore tomorrow! Have you thought about what you'd like to work on or get feedback on during the session?",
  //       feedback_opportunity: (async function () { return await this.before(await this.venue("Office Hours"), { hours: 24, minutes: 0, seconds: 0 }); }).toString(),
  //       feedback_outlet: (async function () { return await this.getSlackChannelForProject(); }).toString()
  //     }
  //   ]
  // });
  // await comingToOhScriptArs.save();
  //
  // const comingToOhScriptNot = new OrchestrationScript({
  //   _id: mongoose.Types.ObjectId("61b01c93abe4a4ea27794106"),
  //   name: "Using venues throughout the week",
  //   description: "Use venues throughout the week to get feedback on in-progress work.",
  //   target: {
  //     students: ["Jason Friedman", "Hang Yin"],
  //     projects: ["Orchestration Scripting Environments"]
  //   },
  //   detector: (async function () { return true; }).toString(), // trigger script immediately in engine
  //   actionable_feedback: [
  //     {
  //       feedback_message: "We have office hours tomorrow! Do you have some in-progress work that you can bring in for us to discuss?",
  //       feedback_opportunity: (async function () { return await this.before(await this.venue("Office Hours"), { hours: 24, minutes: 0, seconds: 0 }); }).toString(),
  //       feedback_outlet: (async function () { return await this.getSlackChannelForProject(); }).toString()
  //     }
  //   ]
  // });
  // await comingToOhScriptNot.save();

  const scopingResearchScript = new OrchestrationScript({
    _id: mongoose.Types.ObjectId("72af28054cfa9c626adcb2aa"),
    name: "Scoping Research Sprints",
    description: "Students should scope their research to the available points, and not be way over-committed.",
    target: (async function() {
      return await this.getAllProjects();
    }).toString(),
    detector: (async function() {
      let currentSprint = await this.getCurrentSprintLog();
      return currentSprint.totalPoints.points_committed.total >= 1.25 * currentSprint.totalPoints.point_available;
    }).toString(),
    actionable_feedback: [
      {
        feedback_message: "Looks like you have planned way more than your available points. Let's talk about slicing strategies today during SIG.",
        feedback_opportunity: (async function () {
          return await this.during(await this.venue("SIG"));
        }).toString(),
        feedback_outlet: (async function () {
          // TODO: inject this into the function
          return await this.sendSlackMessageForProject("Looks like you have planned way more than your available points. Let's talk about slicing strategies today during SIG.");
        }).toString()
      }
    ]
  });
  await scopingResearchScript.save();

  // TODO: add script for if students haven't committed most of their points (like less than 75% of them)

  // TODO: have students send updated sprint logs the day after SIG

  // TODO (stretch): remind students to discuss status update with their mentor 1 week before it, or at the next office hours
};

export const createScriptLibraryFixtures = async () => {
  // clear out the script library
  await OrchestrationScript.deleteMany({}).exec();

  // populate scripts
  await createScripts();
}