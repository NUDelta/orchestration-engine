import { DateTime } from "luxon";
import { getFromStudioAPI } from "../../imports/studioAPI/requests.js";

/**
 * Returns all processes in the organization.
 * Currently, this is only the sprint process.
 * @returns {Promise<[]>} list of all processes in the organization.
 */
export const getAllProcesses = async () => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI("sprints");

    // setup each object and return
    return response.body.map(process => { return formatProcessOrgObject(process); });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
    return error;
  }
};

/**
 * Returns the current processes from the organization.
 * Currently, only the current sprint.
 * @returns {Promise<{}>} current process.
 */
export const getCurrentProcesses = async () => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI("sprints/currentSprint");

    // setup each object and return
    return formatProcessOrgObject(response.body);
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
    return error;
  }
};

/**
 * Converts JSON project from Studio API into a representation for programming on.
 * The returned project object is structured as follows:
 * {
 *     targetType: "process",
 *     name: String,
 *     kind: String,
 *     startDay: Date,
 *     endDay: Date,
 * }
 * @param processApiObj process object from Studio API.
 * @returns {{kind: *, startDay: Date, endDay: Date, name, targetType: string}}
 */
const formatProcessOrgObject = (processApiObj) => {
  // generate the organization data object
  return {
    targetType: "process",
    name: processApiObj.name,
    kind: processApiObj.kind,
    startDay: DateTime.fromISO(processApiObj.start_day).toJSDate(),
    endDay: DateTime.fromISO(processApiObj.end_day).toJSDate()
  };
};