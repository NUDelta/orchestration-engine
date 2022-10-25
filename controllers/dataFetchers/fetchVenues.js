import { getFromStudioAPI } from "../../imports/studioAPI/requests.js";

// TODO: instead of having it as a flat object, might want to have: venues.sig, venues.officeHours

/**
 * Returns all venues in the organization.
 * @returns {Promise<[]>} list of all venues in the organization.
 */
export const getAllVenues = async () => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI("venues");

    // setup each object and return
    return response.body.map(venue => { return formatVenueOrgObject(venue); });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
    return error;
  }
};

/**
 * Returns all venues relevant for a project.
 * @param projectName string name of project to get venues for.
 * @returns {Promise<[]>} list of all venues for the project.
 */
export const getVenuesForProject = async (projectName) => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI(
      "venues/forProject",
      {
        projectName
      });

    // setup each object and return
    return response.body.map(venue => { return formatVenueOrgObject(venue); });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
    return error;
  }
};

/**
 * Returns all venues relevant for a person.
 * @param personName string name of person to get venues for.
 * @returns {Promise<[]>} list of all venues for the person.
 */
export const getVenuesForPerson = async (personName) => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI(
      "venues/forPerson",
      {
        personName
      });

    // setup each object and return
    return response.body.map(venue => { return formatVenueOrgObject(venue); });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
    return error;
  }
};

/**
 * Returns all venues relevant for a SIG.
 * @param sigName string name of SIG to get venues for.
 * @returns {Promise<[]>} list of all venues for the SIG.
 */
export const getVenuesForSig = async (sigName) => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI(
      "venues/forSig",
      {
        sigName
      });

    // setup each object and return
    return response.body.map(venue => { return formatVenueOrgObject(venue); });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
    return error;
  }
};

/**
 * Converts JSON project from Studio API into a representation for programming on.
 * The returned project object is structured as follows:
 * {
 *     targetType: "venue",
 *     name: String,
 *     description: String,
 *     kind: String,
 *     dayOfWeek: String,
 *     startTime: String,
 *     endTime: String,
 *     timezone: String
 * }
 * @param venueApiObject
 * @returns {{dayOfWeek, kind: *, timezone: *, name, description, startTime: *, endTime: *}}
 */
const formatVenueOrgObject = (venueApiObject) => {
  // generate the organization data object
  return {
    targetType: "venue",
    name: venueApiObject.name,
    description: venueApiObject.description,
    kind: venueApiObject.kind,
    dayOfWeek: venueApiObject.day_of_week,
    startTime: venueApiObject.start_time,
    endTime: venueApiObject.end_time,
    timezone: venueApiObject.timezone
  };
};