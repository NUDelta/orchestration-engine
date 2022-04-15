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
 * @return object with information about the venue. Contains the following:
 * {
 *  name: string name of venue
 *  description: string description of venue
 *  day_of_week: string day of week venue occurs
 *  start_time: string start time of venue in format HH:MM:SS
 *  end_time: string end time of venue in format HH:MM:SS
 *  timezone: string timezone of start and end times for venue
 * }
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
    end_time: filteredVenue.end_time,
    timezone: filteredVenue.timezone
  };
};

/**
 * Gets the start and end time of the first SIG meeting of the quarter.
 * @return {Promise<*>}
 */
export const firstSigMeeting = async function () {
  // get info about first SIG meeting based on the this.project
  let venueInfo;
  try {
    let response = await got.get(`${ studioAPIUrl }/venues/sig/firstSig`,
      {
        searchParams: {
          projName: this.project
        },
        responseType: 'json'
      });
    venueInfo = response.body;

    return venueInfo;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }
};

/**
 * Gets the start and end time of the last SIG meeting of the quarter.
 * @return {Promise<*>}
 */
export const lastSigMeeting = async function () {
  // get info about first SIG meeting based on the this.project
  let venueInfo;
  try {
    let response = await got.get(`${ studioAPIUrl }/venues/sig/lastSig`,
      {
        searchParams: {
          projName: this.project
        },
        responseType: 'json'
      });
    venueInfo = response.body;

    return venueInfo;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error }`);
  }
};

// TODO: have a venue trigger for immediate that just returns true so that the script runs immediately