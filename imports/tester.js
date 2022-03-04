import sinon from "sinon";

import { computeTargets, runDetector, getFeedbackOpportunity } from "../controllers/executor.js";
import { MonitoredScripts } from "../models/monitoredScripts.js";
import * as util from "util";
import { checkActiveIssues, checkMonitoredScripts } from "../controllers/executionFlow.js";

const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
  s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

// TODO: create a route that runs tests for a script
// TODO: break this function up into parts that are each called as they will be by the engine in normal operations
/**
 * Simulates the running of orchestration scripts over 1 week.
 * @return {Promise<void>}
 */
export const runSimulationOfScript = async (scriptId, simStartDate, simEndDate, tickAmount) => {
  // setup clock
  let clock;
  clock = sinon.useFakeTimers({ now: simStartDate });

  // start simulation
  let currDate = new Date();
  let endDate = simEndDate;

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

    // check all monitored scripts, and trigger issues
    let createdIssues = await checkMonitoredScripts();

    // check all issues
    let triggeredFeedbackOpps = await checkActiveIssues();

    // print any feedback messages sent
    let feedbackWasPresented = false;
    if (triggeredFeedbackOpps.length > 0) {
      for (const triggeredFeedbackOpp of triggeredFeedbackOpps) {
        let currOppScriptName = triggeredFeedbackOpp.name;
        let currOppTargetProj = triggeredFeedbackOpp.target.project;
        let currOppTargetSts = triggeredFeedbackOpp.target.students;
        let currOppFeedback = triggeredFeedbackOpp.message;

        console.log("--------------------------------------------------------------");
        console.log(`Feedback for ${ currOppScriptName } sent at ${ currTimeStr } to ${ currOppTargetProj }'s Slack Channel:\n${ currOppFeedback }`);
        console.log("--------------------------------------------------------------");

        feedbackWasPresented = true;
      }
    }

    // print current time only if its a multiple of 6 and time was not included with feedback
    if ((currHours % 6 === 0) && !feedbackWasPresented) {
      console.log(currTimeStr);
    }

    // tick clock by 1 hour
    clock.tick(tickAmount);
    currDate = new Date();
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