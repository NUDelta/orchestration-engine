/**
 * This file has functions for accessing information about venues.
 *
 * Each function has access to globalThis which will include:
 * {
 *  students: [list of student names],
 *  projects: [list of project names]
 * }
 **/

import { studioAPIUrl } from "../../index.js";
import got from "got";

// TODO: separate out the logic here into smaller controllers
/**
 * Gets the start and end time that a venue with a given name is occurring.
 * @param venueName
 * @return {string}
 */
export const venue = async function (venueName) {
  // select which venue to query for
  let venueInfo;
  try {
     let response = await got.get(`${ studioAPIUrl }/venues/${ venueName.toLowerCase() }`,
       { responseType: 'json' });
     venueInfo = response.body;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }

  // if SIG, get the SIG the students are in and return that; else return the venue
  let filteredVenue;
  if (venueName.toLowerCase() === "sig") {
    // get all projects
    let projectInfo;
    try {
      let response = await got.get(`${ studioAPIUrl }/projects/`, { responseType: 'json' });
      projectInfo = response.body;
    } catch (error) {
      console.error(`Error in fetching data from Studio API: ${ error }`);
    }

    // get project + sig
    let sigName;
    for (let projectIndex in projectInfo) {
      let currProject = projectInfo[projectIndex];

      if (currProject.name === globalThis.projects[0]) {
        sigName = currProject.sig_name;
        break;
      }
    }

    // filter venue
    for (let venueIndex in venueInfo) {
      let currVenue = venueInfo[venueIndex];

      if (currVenue.name.includes(sigName)) {
        filteredVenue = currVenue;
        break;
      }
    }
  } else {
    filteredVenue = venueInfo[0];
  }

  return {
    name: filteredVenue.name,
    description: filteredVenue.description,
    day_of_week: filteredVenue.day_of_week,
    start_time: filteredVenue.start_time,
    end_time: filteredVenue.end_time
  };
};

// TODO: have a venue trigger for immediate that just returns true so that the script runs immediately