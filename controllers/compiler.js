import { DateTime } from "luxon";
import got from 'got';

// get url for Studio API
const studioAPIUrl = process.env.API_URL;

// helper functions for making API calls
const getStudentsInSig = async (sigName) => {
  // get all data about SIGs
  let allSIGData;
  try {
    allSIGData = await got.get(`${ studioAPIUrl }/venues/sig`, {responseType: 'json'});
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
    allProjectData = await got.get(`${ studioAPIUrl }/projects`, {responseType: 'json'});
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
  target: [String of students] or String with sig: <sig name> or project: <project name>
  condition: String
  actionable_feedback: String
 }
 */
export const compileScriptFromJson = async (scriptAsJson) => {
  // placeholder variables for parsed code
  let parsedTarget = "";
  let parsedCondition = "";
  let parsedFeedback = scriptAsJson.actionable_feedback;

  // parse target
  let currTarget = scriptAsJson.target;

  if (typeof(currTarget) === "string") {
    let splitStringTarget = currTarget.split(": ");

    // get list of students based on whether sig or project
    if (splitStringTarget[0] === "sig") {
      parsedTarget = await getStudentsInSig(splitStringTarget[1]);
    } else if (splitStringTarget[0] === "project") {
      parsedTarget = await getStudentsOnProject(splitStringTarget[1]);
    }
  } else {
   // handle string of student names
  }

  // parse condition
  let currCondition = scriptAsJson.condition;
  // let functionRegex = new RegExp('(before)|(after)|(during)', 'g');
  // let parametersRegex = new RegExp('\((.*?)\)', 'g');
  //
  // let matchedFunction = functionRegex.exec(currCondition);
  // let matchedParams = functionRegex.exec(parametersRegex);
  // console.log(matchedFunction);
  // console.log(matchedParams);

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
  let manipulableDate = venueTime.set({ year: 2021, month: 3, day: dayOfMarch });

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
  parsedCondition = `(DateTime.now().weekday === DateTime.fromISO("${ manipulableDate.toString() }").weekday) &&
    (DateTime.now().hour >= DateTime.fromISO("${ manipulableDate.toString() }").hour) && 
    (DateTime.now().minute >= DateTime.fromISO("${ manipulableDate.toString() }").minute)`;

  // TODO: parse feedback

  // return parsed components
  return {
    parsed_target: parsedTarget,
    parsed_condition: parsedCondition,
    parsed_actionable_feedback: parsedFeedback
  };
};