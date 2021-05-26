import { DateTime } from "luxon";
import got from 'got';
import { compileScriptFromJson } from "./compiler.js";

// get url for Studio API
const studioAPIUrl = process.env.API_URL;

export const simulateScripts = async (scriptList, startTime, endTime) => {
  // compile each script
  let compiledScripts = [];
  for (let i = 0; i < scriptList.length; i++) {
    compiledScripts.push(await compileScriptFromJson(scriptList[i]));
  }

  // track which scripts have been triggered
  let triggeredScriptIndexSet = new Set();

  // simulate
  console.log(`------------- Starting Simulation for S2021 -------------`);

  let currDay = 0;
  let weekCounter = 0;
  while (startTime <= endTime) {
    if (currDay !== startTime.weekday) {
      console.log("\n");
      currDay = startTime.weekday;
      let currDayString = "";
      switch (currDay) {
        case 1:
          currDayString = "Sunday";
          break;
        case 2:
          currDayString = "Monday";
          break;
        case 3:
          currDayString = "Tuesday";
          break;
        case 4:
          currDayString = "Wednesday";
          break;
        case 5:
          currDayString = "Thursday";
          break;
        case 6:
          currDayString = "Friday";
          break;
        case 7:
          currDayString = "Saturday";
          break;
      }

      // clear the trigger set every sunday
      if (currDay === 1) {
        triggeredScriptIndexSet.clear();
        weekCounter++;
        console.log(`------------- Week ${ weekCounter } -------------`);
      }

      console.log(`${ currDayString } | ${ startTime.month }-${ startTime.day }-${ startTime.year }`);
    }

    // check if any scripts meet the conditions
    for (let index = 0; index < compiledScripts.length; index++) {
      if (!triggeredScriptIndexSet.has(index)) {
        // eval condition
        let currDate = startTime;
        let currSprintLog = await getSprintLogForPerson(compiledScripts[index].parsed_target[0]);
        let currTasks = await getTasksForSprint(currSprintLog, currDate.toString());
        let is_condition_met = eval(compiledScripts[index].parsed_detection_condition);

        // check if script condition is met
        if (is_condition_met) {
          let feedbackTarget = compiledScripts[index].parsed_target;
          let feedbackTrigger = compiledScripts[index].parsed_actionable_feedback.parsed_feedback_trigger;
          let feedbackMessage = compiledScripts[index].parsed_actionable_feedback.parsed_feedback_message;

          // check if actionable feedback should be presented immediately, or when compiled trigger is ready
          if (feedbackTrigger === "immediate") {
            triggeredScriptIndexSet.add(index);
            console.log(sendFeedback(startTime, feedbackTarget, feedbackMessage));
          } else {
            let is_feedback_trigger_condition_met = eval(feedbackTrigger);
            if (is_feedback_trigger_condition_met) {
              triggeredScriptIndexSet.add(index);
              console.log(sendFeedback(startTime, feedbackTarget, feedbackMessage));
            }
          }
        }
      }
    }

    // progress hours
    startTime = startTime.plus({ hours: 1 });
  }
  console.log(`------------- Simulation for S2021 Complete -------------`);
}

const sendFeedback = (startTime, targets, feedback) => {
  // parse out each component
  let timestamp = `${ startTime.hour.toString().padStart(2, "0") }:${ startTime.minute.toString().padStart(2, "0") }`;
  let targetString = targets.join(", ")
  let messageString = feedback;

  // compose and return message
  return `${ timestamp } -- ${ targetString }: ${ messageString }`;
};



const getTasksForSprint = async (sprintLog, date) => {
  // get current sprint
  let query = await got.get(`${ studioAPIUrl }/sprints/currentSprint`, {
    searchParams: { timestamp: date },
    responseType: 'json'}
  );
  let currSprintInfo = query.body;

  // get current sprint plan
  let currSprint;
  for (let i = 0; i < sprintLog.sprints.length; i++) {
    if (sprintLog.sprints[i].name === currSprintInfo.name) {
      currSprint = sprintLog.sprints[i];
      break;
    }
  }

  // get all tasks for the sprint plan
  let currTasks = [];
  for (let i = 0; i < currSprint.stories.length; i++) {
    currTasks = currTasks.concat(currSprint.stories[i].tasks);
  }

  return currTasks;
};


const getSprintLogForPerson = async (person) => {
  let query = await got.get(`${ studioAPIUrl }/users/fetchSprintLogForPerson`, {
    searchParams: { personName: person },
    responseType: 'json'}
  );
  let sprintLog = query.body;

  return sprintLog;
};

const getSprintForDate = async (date) => {

};