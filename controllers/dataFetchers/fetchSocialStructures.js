import { getFromStudioAPI } from '../../imports/studioAPI/requests.js';

/**
 * Return all social structures in the organization.
 * @returns {Promise<[]>} list of all social structures in the organization.
 */
export const getAllSocialStructures = async () => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI('socialStructures');

    // setup each object and return
    return response.body.map((struct) => {
      return formatSocialStructureOrgObject(struct);
    });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${error.stack}`);
    return error;
  }
};

/**
 * Return all social structures in the organization for a person.
 * @param personName string name of person to get social structures for.
 * @returns {Promise<[]>} list of all social structures in the organization for personName.
 */
export const getSocialStructuresForPerson = async (personName) => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI('socialStructures/forPerson', {
      personName,
    });

    // setup each object and return
    return response.body.map((struct) => {
      return formatSocialStructureOrgObject(struct);
    });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${error.stack}`);
    return error;
  }
};

/**
 * Return all social structures in the organization for a project.
 * @param projectName string name of project to get social structures for.
 * @returns {Promise<[]>} list of all social structures in the organization for projectName.
 */
export const getSocialStructuresForProject = async (projectName) => {
  try {
    // get data from Studio API
    let response = await getFromStudioAPI('socialStructures/forProject', {
      projectName,
    });

    // setup each object and return
    return response.body.map((struct) => {
      return formatSocialStructureOrgObject(struct);
    });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${error.stack}`);
    return error;
  }
};

/**
 * Converts JSON project from Studio API into a representation for programming on.
 * The returned project object is structured as follows:
 * {
 *     targetType: "social structure",
 *     name: String,
 *     description: String,
 *     kind: String,
 *     members: [{
 *       name: String,
 *       role: String,
 *       email: String,
 *       slackId: String,
 *     }],
 *     // if sig structure:
 *     abbreviation: String,
 *     slackChannel: String,
 *     sigHead: {
 *       name: String,
 *       role: String,
 *       email: String,
 *       slackId: String,
 *     },
 *     // if onboarding pairing:
 *     mentor: {
 *       name: String,
 *       role: String,
 *       email: String,
 *       slackId: String,
 *     },
 *     mentee: {
 *       name: String,
 *       role: String,
 *       email: String,
 *       slackId: String,
 *     },
 *     //if committee structure
 *     committeeHeads: [{
 *       name: String,
 *       role: String,
 *       email: String,
 *       slackId: String,
 *     }]
 * }
 * @param socialStructureApiObj
 * @returns {{members: *, name: *, description: *, targetType: string}}
 */
const formatSocialStructureOrgObject = (socialStructureApiObj) => {
  // start with a base object that everyone shares
  let baseObject = {
    targetType: 'social structure',
    name: socialStructureApiObj.name,
    description: socialStructureApiObj.description,
    kind: socialStructureApiObj.kind,
    members: socialStructureApiObj.members.map((person) => {
      return {
        name: person.name,
        role: person.role,
        email: person.email,
        slackId: person.slack_id,
      };
    }),
  };

  // add other objects based on
  let sigObj =
    socialStructureApiObj.kind === 'SigStructure'
      ? {
          abbreviation: socialStructureApiObj.abbreviation,
          slackChannel: socialStructureApiObj.slack_channel,
          sigHead: {
            name: socialStructureApiObj.sig_head.name,
            role: socialStructureApiObj.sig_head.role,
            email: socialStructureApiObj.sig_head.email,
            slackId: socialStructureApiObj.sig_head.slack_id,
          },
        }
      : {};

  let onboardingObj =
    socialStructureApiObj.kind === 'OnboardingPairing'
      ? {
          mentor: {
            name: socialStructureApiObj.mentor.name,
            role: socialStructureApiObj.mentor.role,
            email: socialStructureApiObj.mentor.email,
            slackId: socialStructureApiObj.mentor.slack_id,
          },
          mentee: {
            name: socialStructureApiObj.mentee.name,
            role: socialStructureApiObj.mentee.role,
            email: socialStructureApiObj.mentee.email,
            slackId: socialStructureApiObj.mentee.slack_id,
          },
        }
      : {};

  let committeeObj =
    socialStructureApiObj.kind === 'CommitteeStructure'
      ? {
          committeeHeads: socialStructureApiObj.committee_heads.map((head) => {
            return {
              name: head.name,
              role: head.role,
              email: head.email,
              slackId: head.slack_id,
            };
          }),
          slackChannel: socialStructureApiObj.slack_channel,
        }
      : {};

  // return combined object
  return { ...baseObject, ...sigObj, ...onboardingObj, ...committeeObj };
};
