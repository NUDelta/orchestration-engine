/**
 * This file has API functions for accessing data about a Project.
 *
 * Each function has access to this which will include:
 * {
 *  students: [list of student names],
 *  projects: [list of project names]
 * }
 **/

import got from "got";
import { studioAPIUrl } from "../../index.js";

export const getStatusUpdateDate = async function () {
  let relevantProject = await getProjectByName(this.project);
  return new Date(relevantProject.status_update_date);
};

/**
 * Gets information for a project by name.
 * @param projName string project name to get info for.
 * @return {Promise<*>}
 */
const getProjectByName = async function (projName) {
  let projectObjs;
  let filteredProjs;

  let output;

  try {
    // get all projects
    let response = await got.get(
      `${ studioAPIUrl }/projects/`,
      {
        responseType: 'json'
      });
    projectObjs = response.body;

    // filter projects based on sig
    filteredProjs = projectObjs.filter((projectObj) => {
      return projectObj.name === projName;
    });

    output = filteredProjs[0];
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }

  return output;
};