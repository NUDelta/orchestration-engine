import { DateTime } from "luxon";
import got from 'got';

// get url for Studio API
const studioAPIUrl = process.env.API_URL;

// helper functions for making API calls
const getStudentsInSig = async (sigName) => {
  // get all data about SIGs
  let allSIGData;
  try {
    allSIGData = await got.get(`${ studioAPIUrl }/venues/sig`, { responseType: 'json' });
    allSIGData = allSIGData.body;

    // get students relevant to that SIG only
    let relevantStudents = [];
    allSIGData.forEach((currSig, index) => {
      if (currSig.name === sigName) {
        currSig.sig_members.forEach((currStudent, index) => {
          relevantStudents.push(currStudent.name);
        });
      }
    });

    return relevantStudents;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }
};

const getStudentsOnProject = async (projectName) => {
  // get all data about projects
  let allProjectData;
  try {
    allProjectData = await got.get(`${ studioAPIUrl }/projects`, { responseType: 'json' });
    allProjectData = allProjectData.body;

    // get students relevant to that SIG only
    let relevantStudents = [];
    allProjectData.forEach((currProj, index) => {
      if (currProj.name === projectName) {
        currProj.students.forEach((currStudent, index) => {
          relevantStudents.push(currStudent.name);
        });
      }
    });

    return relevantStudents;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }
};

const getTimeForVenue = async (venueName) => {
  // get all data for venues
  let allVenuesData;
  try {
    allVenuesData = await got.get(`${ studioAPIUrl }/venues`, {responseType: 'json'});
    allVenuesData = allVenuesData.body;

    // get start_time for relevant venue
    let relevantVenueStartTime = {
      day_of_week: "",
      start_time: undefined
    }
    allVenuesData.forEach((currVenue, index) => {
      if (currVenue.name === venueName) {
        relevantVenueStartTime.day_of_week = currVenue.day_of_week;
        relevantVenueStartTime.start_time = currVenue.start_time;
      }
    });

    return relevantVenueStartTime;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }
};

// helper functions for the script itself
const before = async (venue, timeBefore) => {

};

const during = async (venue) => {

};

const after = async (venue, timeAfter) => {

};

const message = async(content, target) => {

};

// compile script
/*
 json format:
 {
  script_target: [String of students] or String with sig: <sig name> or project: <project name>
  detection_condition: "String"
  actionable_feedback: {
    feedback_trigger: "String",
    feedback_message: "String"
  }
 }
 */
export const compileScriptFromJson = async (scriptAsJson) => {
  // placeholder variables for parsed code
  let parsedTarget = "";
  let parsedDetectionCondition = "";
  let parsedActionableFeedback = {
    parsed_feedback_trigger: "",
    parsed_feedback_message: ""
  };

  // parse target
  parsedTarget = await parseTarget(scriptAsJson.script_target);

  // parse conditions
  parsedDetectionCondition = await parseCondition(scriptAsJson.detection_condition, scriptAsJson.script_target);

  // parse feedback
  if (scriptAsJson.actionable_feedback.feedback_trigger !== "immediate") {
    parsedActionableFeedback.parsed_feedback_trigger = await parseCondition(scriptAsJson.actionable_feedback.feedback_trigger, parsedTarget);
  } else {
    parsedActionableFeedback.parsed_feedback_trigger = "immediate";
  }

  parsedActionableFeedback.parsed_feedback_message = await parseFeedbackMessage(
    scriptAsJson.actionable_feedback.feedback_message);

  // return parsed components
  return {
    parsed_target: parsedTarget,
    parsed_detection_condition: parsedDetectionCondition,
    parsed_actionable_feedback: parsedActionableFeedback
  };
};

const parseTarget = async (currTarget) => {
  // placeholder for parsed target
  let parsedTarget;

  // parse out target
  if (typeof(currTarget) === "string") {
    let splitStringTarget = currTarget.split(": ");

    // get list of students based on whether sig or project
    if (splitStringTarget[0] === "sig") {
      parsedTarget = await getStudentsInSig(splitStringTarget[1]);
    } else if (splitStringTarget[0] === "project") {
      parsedTarget = await getStudentsOnProject(splitStringTarget[1]);
    }
  } else {
    // TODO: handle string of student names
  }

  // return parsed target
  return parsedTarget;
};

const parseCondition = async (currCondition, target) => {
  // placeholder for parsed condition
  let parsedCondition;

  // check if we have a time or tool-based condition
  let timeConditions = ["before", "during", "after"];
  let toolConditions = ["sprintlog"];

  if (timeConditions.some(el => currCondition.includes(el))) {
    // parsing a time-based condition
    parsedCondition = parseTimeBasedCondition(currCondition);
  } else if (toolConditions.some(el => currCondition.includes(el))) {
    // parsing a tool-based condition
    parsedCondition = parseToolBasedCondition(currCondition, target);
  }

  return parsedCondition;
};

const parseTimeBasedCondition = async (currCondition) => {
  // separate condition into chunks
  let firstBracket = currCondition.indexOf("(");
  let secondBracket = currCondition.indexOf(")");
  let functionMatch = currCondition.substring(0, firstBracket);
  let paramMatch = currCondition.substring(firstBracket + 1, secondBracket).split(',');

  // get time for venue
  let timeForVenue = await getTimeForVenue(paramMatch[0]);
  let venueDay = timeForVenue.day_of_week;
  let venueTime = DateTime.fromISO(timeForVenue.start_time);

  // use Sunday March 1, 2020 to do date calculation
  let dayOfMarch = 0;
  switch (venueDay) {
    case "Sunday":
      dayOfMarch = 1;
      break;
    case "Monday":
      dayOfMarch = 2;
      break;
    case "Tuesday":
      dayOfMarch = 3;
      break;
    case "Wednesday":
      dayOfMarch = 4;
      break;
    case "Thursday":
      dayOfMarch = 5;
      break;
    case "Friday":
      dayOfMarch = 6;
      break;
    case "Saturday":
      dayOfMarch = 7;
      break;
  }
  let manipulableDate = venueTime.set({ year: 2021, month: 3, day: dayOfMarch }); // this is for during

  // parse into condition based on function
  if (functionMatch === "before" || functionMatch === "after") {
    // get the amount and unit before/after to compute
    let [amount, unit] = paramMatch[1].trim().split(" ");
    let durationObj = {};
    durationObj[unit] = amount;

    // compute before/after timestamp accordingly
    if (functionMatch === "before") {
      manipulableDate = manipulableDate.minus(durationObj);
    } else {
      manipulableDate = manipulableDate.plus(durationObj);
    }
  }

  // create parsed condition by checking if the correct weekday and the time is greater than
  return `(currDate.weekday === DateTime.fromISO("${ manipulableDate.toString() }").weekday) &&
    (currDate.hour >= DateTime.fromISO("${ manipulableDate.toString() }").hour) && 
    (currDate.minute >= DateTime.fromISO("${ manipulableDate.toString() }").minute)`;
};

const parseToolBasedCondition = async (currCondition, target) => {
  // parse target
  // TODO: handle list of students
  let splitTarget = target.split(": ");
  let parsedTarget;

  if (splitTarget[0] === "project") {
    parsedTarget = splitTarget[1];
  } else if (splitTarget[0] === "sig") {
    // TODO: implement
  }

  // hold parsed condition
  let parsedCondition = "";

  // separate out condition into chunks
  let splitCondition = currCondition.split(".");

  // handle sprintlog
  if (splitCondition[0] === "sprintlog") {
    if (splitCondition[1] === "tasks" && splitCondition[2] === "hasRoadblocks()") {
      // parsedCondition = `(function() { let tasks = getTasksForSprint("${ parsedTarget }", currDate); `;
      //
      // if (splitCondition[2] === "hasRoadblocks()") {
      //   parsedCondition += `return tasks.some(el => { el.expectedRoadblocks !== "" }); })`;
      // }

      parsedCondition = `currTasks.some(el => el.expectedRoadblocks !== "")`;
    }
  }
  return parsedCondition;
};

const parseFeedbackMessage = async (currFeedbackMessage) => {
  // TODO: enable more complex messaging here when needed
  return currFeedbackMessage;
}