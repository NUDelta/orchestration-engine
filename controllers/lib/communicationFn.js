/**
 * This file has functions for determining who and how to communicate with people.
 *
 * Each function has access to globalThis which will include:
 * {
 *  students: [list of student names],
 *  projects: [list of project names]
 * }
 **/

import { studioAPIUrl } from "../../index.js";
import got from "got";

export const getSlackChannelForProject = async function() {
  // get projects
  let projects = globalThis.projects;
  let slackChannels = [];

  for (let currProj of projects) {
    try {
      let response = await got.get(
        `${ studioAPIUrl }/projects/slackChannelForProject`,
        {
          searchParams: {
            projectName: currProj
          },
          responseType: 'json'
        });
      slackChannels.push(response.body);
    } catch (error) {
      console.error(`Error in fetching data from Studio API: ${ error }`);
    }
  }

  return slackChannels;
};

export const getSlackIdForPerson = async function(people) {
  // get people
  let slackIds = [];

  for (let person of people) {
    try {
      let response = await got.get(
        `${ studioAPIUrl }/users/slackIdForPerson`,
        {
          searchParams: {
            personName: person
          },
          responseType: 'json'
        });
      slackIds.push(response.body);
    } catch (error) {
      console.error(`Error in fetching data from Studio API: ${ error }`);
    }
  }

  return slackIds;
};

