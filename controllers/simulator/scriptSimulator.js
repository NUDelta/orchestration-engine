import sinon from "sinon";
import {
  checkActiveIssues,
  checkMonitoredScripts,
  archiveStaleIssues
} from "../execution/executionFlow.js";

const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
  s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

/**
 * Simulates all monitored orchestration scripts from simStartDate to simEndDate.
 * @param simStartDate date when simulation should start.
 * @param simEndDate date when simulation should end.
 * @param tickAmount number of miliseconds to tick the internal clock each iteration.
 * @returns {Promise<boolean|*>} promise if resolved will return true if simulation was successful.
 */
export const runSimulationOfScript = async (simStartDate, simEndDate, tickAmount) => {
  try {
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
      let deliveredStrategies = await checkActiveIssues();

      // add more jitter to the timestamp (60 - 120 seconds) to simulate completion time of step 2
      let step3Jitter = Math.round(60 + (Math.random() * 120));
      clock.tick(step3Jitter  * 1000);

      // step (3): clean-up issues based on expiry time
      let [archivedIssues, activeIssues] = await archiveStaleIssues();

      // print any feedback messages sent
      let feedbackWasPresented = false;
      if (deliveredStrategies.length > 0) {
        for (const deliveredStrategy of deliveredStrategies) {
          console.log(deliveredStrategy)
          let currOppScriptName = deliveredStrategy.name;
          let currOppTargetProj = deliveredStrategy.issue_target.name;
          let currOppTargetSts = deliveredStrategy.issue_target.students;
          let currOppFeedback = deliveredStrategy.delivered_strategy.outlet_args.message;

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

    // let the caller know that everything was successful
    return true;
  } catch (error) {
    console.error(error.stack);
    return error;
  }
};

/**
 * Pads a string to a certain length by pre-pending a given text character.
 * @param date date object that will be converted to a padded string.
 * @param length number how long the padding should be.
 * @param text string that should be used to pad the date string.
 * @return {string} date string pre-padded with text to a certain length.
 */
const padDate = (date, length, text) => {
  return date.toString().padStart(length, text);
};