/**
 * This file has functions for determining who and how to communicate with people.
 *
 * Each function has access to this which will include:
 * {
 *  students: [list of student names],
 *  project: "project name",
 *  message: "message to send",
 *  resources: [
 *    {
 *      link: "link to resource",
 *      description: "description text about resource to help someone use it"
 *    }
 *  ]
 * }
 **/

// TODO: are these even used? seems like they are reimplemented in feedbackFns.js

import { studioAPIUrl } from '../../index.js';
import got from 'got';

// TODO: support message (with text and/or resources) being inject this into the function
/**
 * Sends a message to a Project Channel, given a project and message.
 * @return {Promise<void>}
 */
export const sendSlackMessageForProject = async function () {
  // get project and message
  let projName = this.project;
  let message = this.message;

  // send message to project channel
  try {
    await got.post(`${studioAPIUrl}/slack/sendMessageToProjChannel`, {
      json: { projName, message },
      responseType: 'json',
    });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${error.stack}`);
  }
};

/**
 * Sends a message to a SIG Channel, given a project and message.
 * @return {Promise<void>}
 */
export const sendSlackMessageToSig = async function () {
  // get project and message
  let projName = this.project;
  let message = this.message;

  try {
    // get sig name for project
    let sigNameResponse = await got.get(
      `${studioAPIUrl}/projects/projectByName`,
      {
        searchParams: { projName },
        responseType: 'json',
      }
    );

    let sigName = sigNameResponse.body.sig_name;
    if (sigName !== undefined) {
      // send message to SIG channel
      await got.post(`${studioAPIUrl}/slack/sendMessageToSigChannel`, {
        json: { sigName, message },
        responseType: 'json',
      });
    }
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${error.stack}`);
  }
};

/**
 * Sends a message to the faculty mentor, given and project and message.
 * @returns {Promise<void>}
 */
export const sendSlackMessageToFacultyMentor = async function () {
  // get project and message
  let projName = this.project;
  let message = eval('`' + this.message + '`');

  try {
    // get info for project
    let projectInfoResponse = await got.get(
      `${studioAPIUrl}/projects/projectByName`,
      {
        searchParams: { projName },
        responseType: 'json',
      }
    );

    // get the faculty mentor and send a message to them
    let facultyMentorName = projectInfoResponse.body.faculty_mentor.name;
    if (facultyMentorName !== undefined) {
      // send message to SIG channel
      await got.post(`${studioAPIUrl}/slack/sendMessageToPeople`, {
        json: {
          people: JSON.stringify([facultyMentorName]),
          message: message,
        },
        responseType: 'json',
      });
    }
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${error.stack}`);
  }
};

// TODO: fix to use single project (this is old code)
export const getSlackChannelForProject = async function () {
  // get projects
  let projects = this.projects;
  let slackChannels = [];

  for (let currProj of projects) {
    try {
      let response = await got.get(
        `${studioAPIUrl}/slack/slackChannelForProject`,
        {
          searchParams: {
            projectName: currProj,
          },
          responseType: 'json',
        }
      );
      slackChannels.push(response.body);
    } catch (error) {
      console.error(`Error in fetching data from Studio API: ${error.stack}`);
    }
  }

  return slackChannels;
};

// TODO: why does this take an input instead of using the info from this?
export const getSlackIdForPerson = async function (people) {
  // get people
  let slackIds = [];

  for (let person of people) {
    try {
      let response = await got.get(`${studioAPIUrl}/users/slackIdForPerson`, {
        searchParams: {
          personName: person,
        },
        responseType: 'json',
      });
      slackIds.push(response.body);
    } catch (error) {
      console.error(`Error in fetching data from Studio API: ${error.stack}`);
    }
  }

  return slackIds;
};
