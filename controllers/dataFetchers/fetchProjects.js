import { DateTime } from "luxon";
import { getFromStudioAPI } from "../../imports/studioAPI/requests.js";

/**
 * Returns all projects in the organization.
 * @return {Promise<[]>} list of all projects in organization.
 */
export const getAllProjects = async () => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI("projects", { populateTools: true });

    // setup each object and return
    return response.body.map(proj => { return formatProjectOrgObj(proj); });
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
    let response = await getFromStudioAPI("projects/byName", {
      projectName: projName,
      populateTools: true
    });

    // format project and return
    return formatProjectOrgObj(response.body);
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
    let response = await getFromStudioAPI("projects/forPerson", {
      personName: personName,
      populateTools: true
    });

    // format project and return
    return formatProjectOrgObj(response.body);
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
 * @param projApiObj project object from Studio API.
 * @returns {{sig: *, facultyMentor: {role: *, slackId: *, name, email: *}, sigHead: {role: *, slackId: *, name, email: *}, slackChannel: *, statusUpdateDate: Date, name, students: {role: *, slackId: *, name: *, email: *}[], targetType: string}}
 */
const formatProjectOrgObj = (projApiObj) => {
  // generate the organization data object
  return {
    targetType: "project",
    name: projApiObj.name,
    sig: projApiObj.sig_name,
    sigHead: {
      name: projApiObj.sig_head.name,
      role: projApiObj.sig_head.role,
      email: projApiObj.sig_head.email,
      slackId: projApiObj.sig_head.slack_id
    },
    students: projApiObj.students.map(student => {
      return {
        name: student.name,
        role: student.role,
        email: student.email,
        slackId: student.slack_id
      }
    }),
    facultyMentor: {
      name: projApiObj.faculty_mentor.name,
      role: projApiObj.faculty_mentor.role,
      email: projApiObj.faculty_mentor.email,
      slackId: projApiObj.faculty_mentor.slack_id
    },
    slackChannel: projApiObj.slack_channel,
    statusUpdateDate: DateTime.fromISO(projApiObj.status_update_date).toJSDate(),
    tools: {
      sprintLog: projApiObj.sprint_log.current_sprint
    }
  };
};
