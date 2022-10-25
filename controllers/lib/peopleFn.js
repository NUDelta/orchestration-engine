/**
 * This file has functions for accessing information about people in the community.
 *
 * Each function has access to this which will include:
 * {
 *  students: [list of student names],
 *  projects: [list of project names]
 * }
 **/

import { studioAPIUrl } from "../../index.js";
import got from "got";

/**
 * Gets the SIG Head for a project.
 * @return {Promise<*[]>}
 */
export const getSigHeadForProject = async function() {
  // get projects
  let projects = this.projects;
  let sigHeads = [];

  for (let currProj of projects) {
    try {
      let response = await got.get(
        `${ studioAPIUrl }/projects/peopleOnProject`,
        {
          searchParams: {
            projectName: currProj
          },
          responseType: 'json'
        });
      sigHeads = sigHeads.concat(response.body["sig_head"]);
    } catch (error) {
      console.error(`Error in fetching data from Studio API: ${ error.stack }`);
    }
  }

  return sigHeads;
};

/**
 * Gets all students who are on a project.
 * @return {Promise<*[]>}
 */
export const getStudentsOnProject = async function() {
  // get projects
  let projects = this.projects;
  let studentsOnProj = [];

  for (let currProj of projects) {
    try {
      let response = await got.get(
        `${ studioAPIUrl }/projects/peopleOnProject`,
        {
          searchParams: {
            projectName: currProj
          },
          responseType: 'json'
        });
      studentsOnProj = studentsOnProj.concat(response.body["students"]);
    } catch (error) {
      console.error(`Error in fetching data from Studio API: ${ error.stack }`);
    }
  }

  return studentsOnProj;
};

/**
 * Gets the list of students specified in the script.
 * @return {Promise<[{default: string, type: String | StringConstructor, required: boolean}]|string[]|[{default: string, type: String | StringConstructor, required: boolean}]|*>}
 */
export const getStudentsInScript = async function() {
  return thi.students;
};