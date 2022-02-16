/**
 * This file has API functions for accessing data from the Sprint Log.
 *
 * Each function has access to this which will include:
 * {
 *  students: [list of student names],
 *  projects: [list of project names]
 * }
 **/

import got from "got";
import { studioAPIUrl } from "../../index.js";

// TODO: this can be made into a generic that looks for any single or multiple key words/phrases
/**
 * Checks if a sprint has a prototype task planned.
 *
 * @param taskList
 * @return {Promise<boolean>}
 */
export const hasPrototypeTask = async function (taskList) {
  let searchTerm = "prototype"; // TODO: should also have prototyping
  let hasPrototypeTask = false;

  // search for term "prototype" in task description
  for (let taskIndex in taskList) {
    let currentTask = taskList[taskIndex];
    let currentTaskDescription = currentTask["description"].toLowerCase();

    if (currentTaskDescription.includes(searchTerm)) {
      hasPrototypeTask = true;
      break;
    }
  }

  return hasPrototypeTask;
};

/**
 *
 * @return {Promise<*[]>}
 */
export const getTasksForSprint = async function () {
  // get the sprint log for the project and the current sprint
  let relevantSprintLog = await getSprintLogForProject(this.projects[0]);
  let sprintInfo = await getCurrentSprint();
  let sprint;

  for (let sprintIndex in relevantSprintLog["sprints"]) {
    let currentSprint = relevantSprintLog["sprints"][sprintIndex];
    if (currentSprint.name === sprintInfo.name) {
      sprint = currentSprint;
      break;
    }
  }

  // get all tasks for the sprint
  let tasks = [];
  for (let storyIndex in sprint["stories"]) {
    // append tasks from each story to tasks array
    let currStory = sprint["stories"][storyIndex];
    tasks.push(...currStory["tasks"]);
  }

  // return tasks
  return tasks;
};

export const getCurrentSprintLog = async function () {
  // get the sprint log for the project and the current sprint
  let relevantSprintLog = await getSprintLogForProject(this.project);
  let sprintInfo = await getCurrentSprint();
  let sprint;

  for (let sprintIndex in relevantSprintLog["sprints"]) {
    let currentSprint = relevantSprintLog["sprints"][sprintIndex];
    if (currentSprint.name === sprintInfo.name) {
      sprint = currentSprint;
      break;
    }
  }

  return sprint;
};

// TODO: this should be in a separate controller
/**
 *
 * @param projectName
 * @return {Promise<any>}
 */
const getSprintLogForProject = async function (projectName) {
  // fetch data from the studio api
  let projectSprintLog;
  try {
    let response = await got.get(
      `${ studioAPIUrl }/projects/fetchSprintLogForProject`,
      {
        searchParams: {
          projectName: projectName
        },
        responseType: 'json'
      });
    projectSprintLog = response.body;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }

  return projectSprintLog;
};

/**
 *
 * @return {Promise<any>}
 */
const getCurrentSprint = async function () {
  // get sprint for current date
  let currDate = new Date();

  // fetch sprint for current date
  let currentSprintInfo;
  try {
    currentSprintInfo = await got.get(
      `${ studioAPIUrl }/sprints/currentSprint`,
      {
        searchParams: {
          timestamp: currDate.toISOString()
        },
        responseType: 'json'
      });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }

  return currentSprintInfo.body;
};
