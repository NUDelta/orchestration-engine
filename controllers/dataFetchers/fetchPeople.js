import { getFromStudioAPI } from '../../imports/studioAPI/requests.js';

/**
 * Returns all people in the organization.
 * @returns {Promise<[]>} list of all people in the organization.
 */
export const getAllPeople = async () => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI('people');

    // setup each object and return
    return response.body.map((person) => {
      return formatPersonOrgObject(person);
    });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${error.stack}`);
    return error;
  }
};

/**
 * Returns a person from the organization, given the person's name.
 * @param personName string name of person.
 * @returns {Promise<{}>} person for the given person name.
 */
export const getPersonByName = async (personName) => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI('people/byName', {
      personName: personName,
    });

    // setup each object and return
    return formatPersonOrgObject(response.body);
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${error.stack}`);
    return error;
  }
};

/**
 * Converts JSON project from Studio API into a representation for programming on.
 * The returned project object is structured as follows:
 * {
 *     targetType: "person",
 *     name: String,
 *     sig: String,
 *     role: String,
 *     email: String,
 *     slackId: String,
 *     sigHead: {
 *      name: String,
 *      role: String,
 *      email: String,
 *      slackId: String,
 *    },
 *    tools:{
 *      individualProgressMap: {
 *        url: String
 *      },
 *     midQuarterCheckIn: {
 *        url: String
 *      },
 *     eoqSelfAssessment: {
 *        url: String
 *      },
 *    }
 * }
 * @param personApiObj person object from Studio API.
 * @returns {{sig: *, role: *, slackId: *, sigHead: {}, name, targetType: string, email: *}}
 */
const formatPersonOrgObject = (personApiObj) => {
  // check if the person object has sig head
  let sigHeadObj = {};
  if (personApiObj.sig_head !== undefined) {
    sigHeadObj = {
      name: personApiObj.sig_head.name,
      role: personApiObj.sig_head.role,
      email: personApiObj.sig_head.email,
      slackId: personApiObj.sig_head.slack_id,
    };
  }

  // generate the organization data object
  return {
    targetType: 'person',
    name: personApiObj.name,
    sig: personApiObj.sig_member,
    role: personApiObj.role,
    email: personApiObj.email,
    slackId: personApiObj.slack_id,
    sigHead: sigHeadObj,
    tools: {
      individualProgressMap: {
        url: personApiObj.individual_progress_map ?? '',
      },
      midQuarterCheckIn: {
        url: personApiObj.mid_quarter_check_in ?? '',
      },
      eoqSelfAssessment: {
        url: personApiObj.eoq_self_assessment ?? '',
      },
    },
  };
};
