import sinon from "sinon";

import { computeTargets, runDetector, getFeedbackOpportunity } from "../controllers/executor.js";
import { ActiveScripts } from "../models/activeScripts.js";
import * as util from "util";

const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
  s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

// TODO: create a route that runs tests for a script
// TODO: break this function up into parts that are each called as they will be by the engine in normal operations
/**
 * Simulates the running of orchestration scripts over 1 week.
 * @return {Promise<void>}
 */
export const runSimulationOfScript = async (scriptId, simStartDate, simEndDate, tickAmount) => {
  // fetch target script from database
  let activeScript = await ActiveScripts.findOne({ script_id: scriptId });
  console.log(activeScript)
  let currScript = activeScript.toObject();


  // parse string functions into executable ones
  currScript["target"] = new Function(`return ${ currScript["target"] }`)();
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

  // generate targets
  let computedTargets = await computeTargets(currScript.target);
  // console.log(computedTargets);

  // run detector for each target, and track which issues were generated
  let generatedIssues = [];
  for (const currTarget of computedTargets) {
    let scriptDidTrigger = await runDetector(currTarget, currScript.detector);

    // add targets for which script was triggered
    if (scriptDidTrigger) {
      generatedIssues.push({
        issue_id: ObjectId(),
        target: currTarget
      });
    }
  }

  // for triggered scripts, simulate feedback
  if (generatedIssues.length > 0) {
    // compute feedback opportunities for all issues
    for (const issueIndex in generatedIssues) {
      // get current target
      let currTarget = generatedIssues[issueIndex].target;

      // get run time for actionable feedback
      let feedbackOppForIssue = await getFeedbackOpportunity(currTarget, currScript.actionable_feedback);
      console.log(`Computed feedback opportunities: ${ JSON.stringify(feedbackOppForIssue,null,2) }`);

      // add to list that will be used during simulation
      generatedIssues[issueIndex].computedFeedbackOpps = feedbackOppForIssue;
    }

    console.log(generatedIssues);

    // simulate delivery of feedback
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

      // for any issue, see if any of the triggers should execute
      for (const issueIndex in generatedIssues) {
        // get feedback opportunities for current issue
        const feedbackOpportunities = generatedIssues[issueIndex].computedFeedbackOpps;
        const currTarget = generatedIssues[issueIndex].target;

        // see if any of the triggers should execute
        let feedbackWasPresented = false;
        for (const currOpportunity of feedbackOpportunities) {
          // separate out components of feedback opp
          let currFeedbackDate = currOpportunity.trigger_date.getTime();
          let currFeedbackMessage = currOpportunity.feedback_message;
          let currFeedbackOutletFn = currOpportunity.feedback_outlets;

          // TODO: this needs to be a fuzzy match since milliseconds are not guaranteed to match
          // check if it's time to send the actionable feedback
          if (currDate.getTime() === currFeedbackDate) {
            // execute feedback function
            await currFeedbackOutletFn.runScript();

            console.log("--------------------------------------------------------------");
            console.log(`Feedback for ${ currScript.name } sent at ${ currTimeStr } to ${ currTarget.project }'s Slack Channel:\n${ currOpportunity.feedback_message }`);
            console.log("--------------------------------------------------------------");

            feedbackWasPresented = true;
          }
        }

        // print current time only if its a multiple of 6 and time was not included with feedback
        if ((currHours % 6 === 0) && !feedbackWasPresented) {
          console.log(currTimeStr);
        }
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