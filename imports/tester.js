import sinon from "sinon";

import { runDetector, getFeedbackOpportunity } from "../controllers/executor.js";

/**
 * Simulates the running of orchestration scripts over 1 week.
 * @return {Promise<void>}
 */
export const runTests = async () => {
  // setup clock
  let clock;
  clock = sinon.useFakeTimers({ now: new Date(2021, 4, 31) });
  let tickAmount = 1 * 60 * 60 * 1000; // 1 hour * 60 minutes * 60 seconds * 1000 ms;


  console.log(`Running script: ${ prototypingScript.script_name }.\
  \nScript object: ${ JSON.stringify(prototypingScript,null,2) }`);

  // run script detector
  let scriptDidTrigger = await runDetector(prototypingScript);
  console.log(`Did Prototype Script Trigger? ${ scriptDidTrigger }`);

  if (scriptDidTrigger) {
    // simulate
    let currDate = new Date();
    let endDate = new Date(2021, 5, 7);

    // get run time for actionable feedback
    let feedbackOpportunities = await getFeedbackOpportunity(prototypingScript);
    console.log(`Computed feedback opportunities: ${ JSON.stringify(feedbackOpportunities,null,2) }`);

    // simulate and check the trigger
    console.log(`Simulating from ${ currDate } to ${ endDate }`);
    while (currDate < endDate) {
      // pull out date components
      let currHours = currDate.getHours();
      let currMins = currDate.getMinutes();
      let currSecs = currDate.getSeconds();

      // print day/date only if time is 00:00
      if (currHours=== 0 && currMins === 0 && currSecs === 0) {
        console.log(`\n${ currDate.toDateString() }`);
      }

      // current time
      console.log(`${ padDate(currHours, 2, "0") }:${ padDate(currMins, 2, "0") }`);

      // see if any of the triggers should execute
      feedbackOpportunities.forEach(currOpportunity => {
        // check if it's time to send the actionable feedback
        if (currDate.getTime() === currOpportunity.trigger_date.getTime()) {
          console.log(`Feedback for ${ prototypingScript.script_name }: \n${ currOpportunity.feedback_message } \n`);
        }
      });

      // tick clock by 1 hour
      clock.tick(tickAmount);
      currDate = new Date();
    }
  }

  // reset clock
  clock.restore();
};

/**
 * Pads a string to a certain length by pre-pending a given text character.
 *
 * @param date
 * @param length
 * @param text
 * @return {string}
 */
const padDate = (date, length, text) => {
  return date.toString().padStart(length, text);
};

// TODO: two functions to try
// (1) prototyping process (with multiple triggers that go off)
// (2) remind me to check on my student's meta-blockers at the end of each sprint
const prototypingScript = {
  script_name: "Prototyping slices w/testing each week",
  script_description: "When students plan to do prototyping, they should aim to do a slice where they (1) draft arguments; (2) make the prototype; (3) conduct a user test; and (4) do takeaways from user testing to update their arguments.",
  // TODO: this could also be in a declarative, where you can get things like new students at runtime
  script_target: {
    students: ["Jason Friedman", "Hang Yin"], // getStudentsForSIG("SIG NAME"); alt: function () { return ["jason", "hang"] }
    projects: ["Orchestration Scripting Environments"]
  },
  detector: async function () {
    return await hasPrototypeTask(await getTasksForSprint());
  },
  actionable_feedback: [
    {
      feedback_message: "Looks like you have prototyping planned for this sprint. During SIG, let's talk about your plan for the week and make sure you'll get testing in before next SIG.",
      feedback_opportunity: async function () { return await during(await venue("SIG")); }
    },
    {
      feedback_message: "How is your prototyping sprint going? Are you on track to have testing done and takeaways before SIG? What can you do during Pair Research and Mysore in Studio to help move you in the right direction?",
      feedback_opportunity: async function () { return await during(await venue("Studio")); }
    }
  ]
};