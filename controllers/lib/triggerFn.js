import { studioAPIUrl } from "../../index.js";
import { DateTime } from "luxon";

// TODO: consider returning a time-frame for each of these scripts
// e.g., +- 10 mins from the trigger date (though, this should be dependent on the context)
// during: up to 10 mins after the venue has started
// before: up to 10 mins before the timestamp
// after: up to 10 mins after the timestamp


// TODO: this might be messing up due to daylight savings time from using the default date in the studio api
/**
 * Returns a timestamp for when to execute a script during the next instance of a venue.
 * TODO: to support DST, start_time and end_time should be strings like HH:MM, and also timezone.
 * @param venue object with information about the venue. Contains the following:
 * {
 *  name: string name of venue
 *  description: string description of venue
 *  day_of_week: string day of week venue occurs
 *  start_time: Date start time of venue (only encoded time)
 *  end_time: Date end time of venue
 * }
 * @return {Promise<Date>}
 */
export const during = async function(venue) {
  // logic: check to see if the venue is still coming this week (if not send to next week)
  let nextVenue = computeNextVenue(new Date(),
    venue.day_of_week,
    new Date(venue.start_time),
    new Date(venue.end_time));

  // return the time that script should trigger
  // for during, script triggers at the beginning of the venue (so, the start time)
  return nextVenue.start_time;
};

/**
 * Returns a timestamp for when to execute a script before the next instance of a venue.
 * @param venue object with information about the venue. Contains the following:
 * {
 *  name: string name of venue
 *  description: string description of venue
 *  day_of_week: string day of week venue occurs
 *  start_time: Date start time of venue (only encoded time)
 *  end_time: Date end time of venue
 * }
 * @param timeBefore object used to compute number of milliseconds before venue:
 * {
 *   hours: number of hours
 *   minutes: number of minutes
 *   seconds: number of seconds
 * }
 * @return {Promise<Date>}
 */
export const before = async function(venue, timeBefore) {
  // logic: check to see if the venue is still coming this week (if not send to next week)
  let nextVenue = computeNextVenue(new Date(),
    venue.day_of_week,
    new Date(venue.start_time),
    new Date(venue.end_time));

  // compute time to subtract in milliseconds
  let timeToSubtract = timeBefore.hours * 3600000 +
    timeBefore.minutes * 60000 +
    timeBefore.seconds * 1000;

  // return the time that script should trigger
  // for before, take the start_time and subtract timeBefore from it
  return new Date(nextVenue.start_time.getTime() - timeToSubtract);
};

/**
 * TODO: This will not work as expected if time needs to be rounded to be matched.
 * Returns a timestamp for when to execute a script after the next instance of a venue.
 * @param venue object with information about the venue. Contains the following:
 * {
 *  name: string name of venue
 *  description: string description of venue
 *  day_of_week: string day of week venue occurs
 *  start_time: Date start time of venue (only encoded time)
 *  end_time: Date end time of venue
 * }
 * @param timeAfter object used to compute number of milliseconds before venue:
 * {
 *   hours: number of hours
 *   minutes: number of minutes
 *   seconds: number of seconds
 * }
 * @return {Promise<Date>}
 */
export const after = async function(venue, timeAfter) {
  // logic: check to see if the venue is still coming this week (if not send to next week)
  let nextVenue = computeNextVenue(new Date(),
    venue.day_of_week,
    new Date(venue.start_time),
    new Date(venue.end_time));

  // compute time to subtract in milliseconds
  let timeToAdd = timeAfter.hours * 3600000 +
    timeAfter.minutes * 60000 +
    timeAfter.seconds * 1000;

  // return the time that script should trigger
  // for before, take the start_time and subtract timeBefore from it
  return new Date(nextVenue.start_time.getTime() + timeToAdd);
};

// TODO: write test cases to check this more rigorously.
/**
 * Computes the date and time of the next available venue.
 * 
 * (1) get the day index of the current date and target day of the week
 * (2) compute targetDayOfWeekIndex - currDayOfWeekIndex to get the shift that needs to be applied to currDate.
 * (3) if the shift is < 1, add 7 to roll over to next week.
 * (4) add this shift to the current date to get the new date
 * (5) replace the timestamp with the start/end times of the venue.
 * @param currDate
 * @param targetDayOfWeek
 * @param venueStartTime
 * @param venueEndTime
 */
const computeNextVenue = function (currDate, targetDayOfWeek, venueStartTime, venueEndTime) {
  // get the number of days to shift date based on when the next venue is
  let targetDayOfWeekIndex = dayOfWeekToIndex(targetDayOfWeek);
  let currDayOfWeekIndex = currDate.getDay();

  // TODO: something about this incrementing thing is not adding properly
  let nextVenueDayShift = targetDayOfWeekIndex - currDayOfWeekIndex;
  if (nextVenueDayShift < 0) {
    nextVenueDayShift += 7;
  }


  // shift current date
  let nextVenueDate = new Date(currDate);
  nextVenueDate.setDate(nextVenueDate.getDate() + nextVenueDayShift);

  // create new start and end times for the venue
  let nextVenueStartTime = new Date(nextVenueDate);
  nextVenueStartTime.setHours(venueStartTime.getHours(), venueStartTime.getMinutes());

  let nextVenueEndTime = new Date(nextVenueDate);
  nextVenueEndTime.setHours(venueEndTime.getHours(), venueEndTime.getMinutes());

  // TODO: need to zero ou the seconds otherwise exact match will not work (this could happen

  // console.log('Current date', currDate)
  // console.log('Venue Start Time', venueStartTime)
  // console.log('Venue End Time', venueEndTime)
  // console.log('Curr day of week', currDate.getDay())
  // console.log('Target day of week', dayOfWeekToIndex(targetDayOfWeek))
  // console.log('Next venue day shift', nextVenueDayShift);
  // console.log('Next venue date', nextVenueDate)
  // console.log('Next venue start and end time', nextVenueStartTime, nextVenueEndTime)

  // TODO edge case: check if the day is today, but the venue time has already passed. if so, add 1 week.
  // careful tho since the venue may still be applicable with the after function
  return {
    start_time: nextVenueStartTime,
    end_time: nextVenueEndTime
  };
};

/**
 * Converts a string day of the week to an integer index.
 *
 * @param dayString
 * @return {number}
 */
const dayOfWeekToIndex = function (dayString) {
  let dayIndex;
  switch (dayString) {
    case "Sunday":
      dayIndex = 0;
      break;
    case "Monday":
      dayIndex = 1;
      break;
    case "Tuesday":
      dayIndex = 2;
      break;
    case "Wednesday":
      dayIndex = 3;
      break;
    case "Thursday":
      dayIndex = 4;
      break;
    case "Friday":
      dayIndex = 5;
      break;
    case "Saturday":
      dayIndex = 6;
      break;
  }

  return dayIndex;
};