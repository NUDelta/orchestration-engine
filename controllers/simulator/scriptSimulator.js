import sinon from "sinon";
import {
  checkActiveIssues,
  checkMonitoredScripts,
  cleanUpActiveIssues
} from "../execution/executionFlow.js";

const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
  s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

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

    // add some jitter to the timestamp (0 - 30 seconds) to simulate lag on server
    let step1Jitter = Math.round(Math.random() * 30);
    clock.tick(step1Jitter * 1000);

    // step (1): check all monitored scripts, and create issues for triggered scripts
    let createdIssues = await checkMonitoredScripts();

    // add more jitter to the timestamp (60 - 120 seconds) to simulate completion time of step 1
    let step2Jitter = Math.round(60 + (Math.random() * 60));
    clock.tick(step2Jitter * 1000);

    // step (2): check active issues to see if any feedback was triggered
    let triggeredFeedbackOpps = await checkActiveIssues();

    // add more jitter to the timestamp (60 - 120 seconds) to simulate completion time of step 2
    let step3Jitter = Math.round(60 + (Math.random() * 120));
    clock.tick(step3Jitter  * 1000);

    // step (3): clean-up issues based on expiry time
    let [archivedIssues, activeIssues] = await cleanUpActiveIssues();

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
    if ((currHours % 6 === 0) && (currMins === 0) && !feedbackWasPresented) {
      console.log(currTimeStr);
    }

    // tick clock by 1 hour - jitter that was added above
    let totalJitter = step1Jitter + step2Jitter + step3Jitter;
    clock.tick(tickAmount - (totalJitter * 1000));
    currDate = new Date();
  }

  console.log(`------ Simulation Complete ------ \n`);

  // reset clock
  clock.restore();

  // TODO: clean up models after simulation so it can be run again
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