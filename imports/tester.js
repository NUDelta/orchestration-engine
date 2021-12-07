import sinon from "sinon";

import { runDetector, getFeedbackOpportunity } from "../controllers/executor.js";
import { ActiveScripts } from "../models/activeScripts.js";
import { simulateScriptOverTimeFrame } from "../controllers/simulator.js";
import { OrchestrationScript } from "../models/scriptLibrary.js";


// TODO: create a route that runs tests for a script
// TODO: break this function up into parts that are each called as they will be by the engine in normal operations
/**
 * Simulates the running of orchestration scripts over 1 week.
 * @return {Promise<void>}
 */
export const runTests = async (scriptId, simStartDate, simEndDate) => {
  // fetch target script from database
  let activeScripts = await ActiveScripts.find({orchestration_script: scriptId}).populate("orchestration_script");
  let currScript = activeScripts[0]["orchestration_script"].toObject();

  // parse string functions into executable ones
  currScript["detector"] = new Function(`return ${ currScript["detector"] }`)();
  currScript["actionable_feedback"].forEach((currActionableFeedback, index, arr) => {
    arr[index] = {
      feedback_message: currActionableFeedback["feedback_message"],
      feedback_opportunity: new Function(`return ${ currActionableFeedback["feedback_opportunity"] }`)()
    }
  });

  // setup clock
  let clock;
  clock = sinon.useFakeTimers({ now: simStartDate });
  let tickAmount = 1 * 60 * 60 * 1000; // 1 hour * 60 minutes * 60 seconds * 1000 ms;


  console.log(`Running script: ${ currScript.name }.\
  \nScript object: ${ JSON.stringify(currScript,null,2) }`);

  // run script detector
  let scriptDidTrigger = await runDetector(currScript);
  console.log(`Did Prototype Script Trigger? ${ scriptDidTrigger }`);

  if (scriptDidTrigger) {
    // simulate
    let currDate = new Date();
    let endDate = simEndDate;

    // TODO: fetch scripts from database
    // get run time for actionable feedback
    let feedbackOpportunities = await getFeedbackOpportunity(currScript);
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
          console.log(`Feedback for ${ currScript.name }: \n${ currOpportunity.feedback_message } \n`);
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