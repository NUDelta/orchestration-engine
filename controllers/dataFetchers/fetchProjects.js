import { studioAPIUrl } from "../../index.js";
import got from "got";
import { DateTime } from "luxon";

/**
 * Returns all projects in the organization.
 * @return {Promise<*[]>} list of all projects in organization.
 */
export const getAllProjects = async () => {
  try {
    // get data from Studio API
    let response = await got.get(
      `${ studioAPIUrl }/projects`,
      {
        searchParams: {
          populateTools: true
        },
        responseType: 'json',
        retry: {
          limit: 3,
          methods: ["GET"]
        }
      });

    let projResponse = response.body;

    // setup each object and return
    let outputProjects = [];
    for (let proj of projResponse) {
      outputProjects.push(projectParser(proj));
    }

    return outputProjects;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
    return error;
  }
};

/**
 * Returns a project from the organization, given the project's name.
 * @param projName string name of project.
 * @returns {Promise<{}>} project for the given project name.
 */
export const getProjectByName = async (projName) => {
  try {
    // get data from Studio API
    let response = await got.get(
      `${ studioAPIUrl }/projects/byName`,
      {
        searchParams: {
          projectName: projName,
          populateTools: true
        },
        responseType: 'json',
        retry: {
          limit: 3,
          methods: ["GET"]
        }
      });

    // format project and return
    let projResponse = response.body;
    return projectParser(projResponse);
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
    return error;
  }
};

/**
 * Returns a project from the organization, given the person's name.
 * @param personName string name of person to get project for.
 * @returns {Promise<{}>} project for the given person name.
 */
export const getProjectForPerson = async (personName) => {
  try {
    // get data from Studio API
    let response = await got.get(
      `${ studioAPIUrl }/projects/forPerson`,
      {
        searchParams: {
          personName: personName,
          populateTools: true
        },
        responseType: 'json',
        retry: {
          limit: 3,
          methods: ["GET"]
        }
      });

    // format project and return
    let projResponse = response.body;
    return projectParser(projResponse);
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
    return error;
  }
};

/**
 * Converts JSON project from Studio API into a representation for programming on.
 * The returned project object is structured as follows:
 * {
 *   targetType: "project",
 *   name: String,
 *   sig: String,
 *   students: [
 *     {
 *      name: String,
 *      role: String,
 *      email: String,
 *      slackId: String
 *     }
 *   ],
 *   sigHead: {
 *     name: String,
 *     role: String,
 *     email: String,
 *     slackId: String
 *   },
 *   facultyMentor: {
 *     name: String,
 *     role: String,
 *     email: String,
 *     slackId: String
 *   }
 *   slackChannel: String,
 *   statusUpdateDate: Date
 *   tools: {
 *     // current sprint log
 *     sprintLog: sprintLogObject from Studio API
 *   },
 *
 * }
 * @param projJsonObj project object from Studio API.
 * @returns {{sig: *, facultyMentor: {role: *, slackId: *, name, email: *}, sigHead: {role: *, slackId: *, name, email: *}, slackChannel: *, statusUpdateDate: Date, name, students: {role: *, slackId: *, name: *, email: *}[], targetType: string}}
 */
const projectParser = (projJsonObj) => {
  return {
    targetType: "project",
    name: projJsonObj.name,
    sig: projJsonObj.sig_name,
    sigHead: {
      name: projJsonObj.sig_head.name,
      role: projJsonObj.sig_head.role,
      email: projJsonObj.sig_head.email,
      slackId: projJsonObj.sig_head.slack_id
    },
    students: projJsonObj.students.map(student => {
      return {
        name: student.name,
        role: student.role,
        email: student.email,
        slackId: student.slack_id
      }
    }),
    facultyMentor: {
      name: projJsonObj.faculty_mentor.name,
      role: projJsonObj.faculty_mentor.role,
      email: projJsonObj.faculty_mentor.email,
      slackId: projJsonObj.faculty_mentor.slack_id
    },
    slackChannel: projJsonObj.slack_channel,
    statusUpdateDate: DateTime.fromISO(projJsonObj.status_update_date).toJSDate(),
    tools: {
      sprintLog: projJsonObj.sprint_log.current_sprint
    }
  };
};