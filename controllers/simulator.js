import sinon from "sinon";
import { getFeedbackOpportunity } from "./executor.js";
// TODO: there is a separate package for fake timers that should be used here instead of sinon
// https://sinonjs.org/releases/latest/fake-timers/

/**
 * Simulates time changing over a specified time frame.
 *
 * @param startDate
 * @param endDate
 * @param simulateInfinitely
 * @return {Promise<void>}
 */
export const simulateScriptOverTimeFrame = async (startDate, endDate, simulateInfinitely, script) => {
  // setup clock
  let clock;
  clock = sinon.useFakeTimers({ now: startDate });

  // set tick amount for simulation
  // 6 hours * 60 minutes * 60 seconds * 1000 ms
  let tickAmount = 6 * 60 * 60 * 1000;

  // get run time for actionable feedback
  let feedbackOpportunities = await getFeedbackOpportunity(script);
  console.log(`Computed feedback opportunities: ${ JSON.stringify(feedbackOpportunities,null,2) }`);

  // iterate over days
  let currDate = new Date();
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
        console.log(`Feedback for ${ script.name }: \n${ currOpportunity.feedback_message } \n`);
      }
    });

    // tick clock by 1 hour
    clock.tick(tickAmount);
    currDate = new Date();

    // continue infinitely, if desired
    if (simulateInfinitely && (currDate >= endDate)) {
      console.log(`---- simulation complete. repeating again from ${ startDate.toDateString() } ---- `);
      currDate = startDate;
      clock = sinon.useFakeTimers({ now: startDate });
    }
  }

  // restore clock to original
  clock.restore();
};

const padDate = (date, length, text) => {
  return date.toString().padStart(length, text);
};