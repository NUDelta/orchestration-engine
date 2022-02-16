/**
 * This file has functions for accessing information about venues.
 *
 * Each function has access to this which will include:
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
  // parse venue name
  let parsedVenueName;
  switch (venueName) {
    case "SIG":
      parsedVenueName = "sig";
      break;
    case "Studio":
      parsedVenueName = "studio";
      break;
    case "Office Hours":
      parsedVenueName = "officehours";
      break;
    default:
      parsedVenueName = ""
      break;
  }

  // select which venue to query for
  let venueInfo;
  try {
     let response = await got.get(`${ studioAPIUrl }/venues/${ parsedVenueName }`,
       { responseType: 'json' });
     venueInfo = response.body;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }

  // if SIG or office hours, get the SIG of the students and then return just the venue for them
  let filteredVenue;
  if ((parsedVenueName === "sig") || parsedVenueName === "officehours") {
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

      if (currProject.name === this.project) {
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