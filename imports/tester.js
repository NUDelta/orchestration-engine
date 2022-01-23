import sinon from "sinon";

import { runDetector, getFeedbackOpportunity } from "../controllers/executor.js";
import { ActiveScripts } from "../models/activeScripts.js";
import * as util from "util";


// TODO: create a route that runs tests for a script
// TODO: break this function up into parts that are each called as they will be by the engine in normal operations
/**
 * Simulates the running of orchestration scripts over 1 week.
 * @return {Promise<void>}
 */
export const runSimulationOfScript = async (scriptId, simStartDate, simEndDate, tickAmount) => {
  // fetch target script from database
  let activeScript = await ActiveScripts.findOne({ script_id: scriptId });
  let currScript = activeScript.toObject();

  // parse string functions into executable ones
  currScript["detector"] = new Function(`return ${ currScript["detector"] }`)();
  currScript["actionable_feedback"].forEach((currActionableFeedback, index, arr) => {
    arr[index] = {
      feedback_message: currActionableFeedback["feedback_message"],
      feedback_opportunity: new Function(`return ${ currActionableFeedback["feedback_opportunity"] }`)(),
      feedback_outlet: new Function(`return ${ currActionableFeedback["feedback_outlet"] }`)()
    }
  });

  // setup clock
  let clock;
  clock = sinon.useFakeTimers({ now: simStartDate });

  // print script that we're about to run
  console.log(`Running script: ${ currScript.name }.\
  \nScript object: ${ util.inspect(currScript) }`);

  // run script detector
  let scriptDidTrigger = await runDetector(currScript);
  console.log(`Did Prototype Script Trigger? ${ scriptDidTrigger }`);

  if (scriptDidTrigger) {
    // simulate
    let currDate = new Date();
    let endDate = simEndDate;

    // get run time for actionable feedback
    let feedbackOpportunities = await getFeedbackOpportunity(currScript);
    console.log(`Computed feedback opportunities: ${ JSON.stringify(feedbackOpportunities,null,2) }`);

    // simulate and check the trigger
    console.log(`------ Simulating from ${ currDate } to ${ endDate } ------ `);
    while (currDate < endDate) {
      // pull out date components
      let currHours = currDate.getHours();
      let currMins = currDate.getMinutes();
      let currSecs = currDate.getSeconds();

      // compute the current date string
      let currTimeStr = `${ padDate(currHours, 2, "0") }:${ padDate(currMins, 2, "0") }`;

      // print day/date only if time is 00:00
      if (currHours=== 0 && currMins === 0 && currSecs === 0) {
        console.log(`\n${ currDate.toDateString() }`);
      }


      // see if any of the triggers should execute
      let feedbackWasPresented = false;
      feedbackOpportunities.forEach(currOpportunity => {
        // TODO: this needs to be a fuzzy match since milliseconds are not guaranteed to match
        // check if it's time to send the actionable feedback
        if (currDate.getTime() === currOpportunity.trigger_date.getTime()) {
          console.log(`${ currTimeStr }\nFeedback for: ${ currScript.name }: \nSent to ${ currOpportunity.feedback_outlets.join("/") } -- ${ currOpportunity.feedback_message } \n`);
          feedbackWasPresented = true;
        }
      });

      // print current time only if its a multiple of 6 and time was not included with feedback
      if ((currHours % 6 === 0) && !feedbackWasPresented) {
        console.log(currTimeStr);
      }

      // tick clock by 1 hour
      clock.tick(tickAmount);
      currDate = new Date();
    }
  }
  console.log(`------ Simulation Complete ------ \n`);

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