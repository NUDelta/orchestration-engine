/**
 * This module contains helper functions for manipulating dates.
 */
import { DateTime } from 'luxon';
import { getFromStudioAPI } from '../../imports/studioAPI/requests.js';

/*
  TODO:
  - Support something like "noon the day before" or "noon the day after a venue"
  - ^ in general for this: morning, noon, afternoon
  - Having things like "beginning/middle/end of week"
  - May need separate before(...) and after(...) functions that work for getFirst() and getLast() since those return dates and not venue objects.
  - Handle cases where the opportunity doesn't exist (e.g., OH for RALE is on-demand only)
 */

/**
 * Returns the Date numWeeks before an event.
 * @param eventDate date for an event to get number of weeks before.
 * @param numWeeks number of weeks to get time before the event.
 * @returns {Promise<Date>} date numWeeks before eventDate.
 */
export const weeksBefore = async function (eventDate, numWeeks) {
  // shift time from eventDate
  let shiftedTime = DateTime.fromJSDate(eventDate).minus({
    hours: numWeeks * 7 * 24, // numWeeks * 7 days/week * 24 hours/day
    minutes: 0,
    seconds: 0,
  });

  // return the shifted time
  return shiftedTime.toJSDate();
};

/**
 * Returns the Date numDays before an event.
 * @param eventDate date for an event to get number of days before.
 * @param numDays number of days to get time before the event.
 * @returns {Promise<Date>} date numDays before eventDate.
 */
export const daysBefore = async function (eventDate, numDays) {
  // shift time from eventDate
  let shiftedTime = DateTime.fromJSDate(eventDate).minus({
    hours: numDays * 24, // numDays * 24 hours/day
    minutes: 0,
    seconds: 0,
  });

  // return the shifted time
  return shiftedTime.toJSDate();
};

/**
 * Returns the Date numDays after an event.
 * @param eventDate date for an event to get number of days after.
 * @param numDays number of days to get time after the event.
 * @returns {Promise<Date>} date numDays after eventDate.
 */
export const daysAfter = async function (eventDate, numDays) {
  // shift time from eventDate
  let shiftedTime = DateTime.fromJSDate(eventDate).plus({
    hours: numDays * 24, // numDays * 24 hours/day
    minutes: 0,
    seconds: 0,
  });

  // return the shifted time
  return shiftedTime.toJSDate();
};

/**
 * Returns the Date numDays before the start of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @param numDays number of days to get time before venue.
 * @returns {Promise<Date>} date numDays before venue's start time.
 */
export const daysBeforeVenue = async function (venue, numDays) {
  return before(venue, {
    hours: numDays * 24, // numDays * 24 hours/day
    minutes: 0,
    seconds: 0,
  });
};

/**
 * Returns the Date numHours before the start of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @param numHours number of hours to get time before venue.
 * @returns {Promise<Date>} date numHours before venue's start time.
 */
export const hoursBeforeVenue = async function (venue, numHours) {
  return before(venue, {
    hours: numHours,
    minutes: 0,
    seconds: 0,
  });
};

/**
 * Returns the Date numMinutes before the start of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @param numMinutes number of minutes to get time before venue.
 * @returns {Promise<Date>} date numMinutes before venue's start time.
 */
export const minutesBeforeVenue = async function (venue, numMinutes) {
  return before(venue, {
    hours: 0,
    minutes: numMinutes,
    seconds: 0,
  });
};

/**
 * Returns the Date numWeeks after an event.
 * @param eventDate date for an event to get number of weeks after.
 * @param numWeeks number of weeks to get time after the event.
 * @returns {Promise<Date>} date numWeeks after eventDate.
 */
export const weeksAfter = async function (eventDate, numWeeks) {
  // shift time from eventDate
  let shiftedTime = DateTime.fromJSDate(eventDate).plus({
    hours: numWeeks * 7 * 24, // numWeeks * 7 days/week * 24 hours/day
    minutes: 0,
    seconds: 0,
  });

  // return the shifted time
  return shiftedTime.toJSDate();
};

/**
 * Returns the Date numDays after the start of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @param numDays number of days to get time after venue.
 * @returns {Promise<Date>} date numDays after venue's start time.
 */
export const daysAfterVenue = async function (venue, numDays) {
  return after(venue, {
    hours: numDays * 24, // numDays * 24 hours/day
    minutes: 0,
    seconds: 0,
  });
};

/**
 * Returns the Date numHours after the start of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @param numHours number of hours to get time after venue.
 * @returns {Promise<Date>} date numHours after venue's end time.
 */
export const hoursAfterVenue = async function (venue, numHours) {
  return after(venue, {
    hours: numHours,
    minutes: 0,
    seconds: 0,
  });
};

/**
 * Returns the Date numMinutes after the start of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @param numMinutes number of minutes to get time after venue.
 * @returns {Promise<Date>} date numMinutes after venue's start time.
 */
export const minutesAfterVenue = async function (venue, numMinutes) {
  return after(venue, {
    hours: 0,
    minutes: numMinutes,
    seconds: 0,
  });
};

/**
 * Returns the Date the morning of the next instance of venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<Date>} date of next venue in the morning.
 */
export const morningOfVenue = async function (venue) {
  return getTimeOfDayForVenue(venue, 'morning');
};

/**
 * Returns the Date the noon of the next instance of venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<Date>} date of next venue at noon.
 */
export const noonOfVenue = async function (venue) {
  return getTimeOfDayForVenue(venue, 'noon');
};

/**
 * Returns the Date the afternoon of the next instance of venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<Date>} date of next venue in the afternoon.
 */
export const afternoonOfVenue = async function (venue) {
  return getTimeOfDayForVenue(venue, 'afternoon');
};

/**
 * Returns the Date the evening of the next instance of venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<Date>} date of next venue in the evening.
 */
export const eveningOfVenue = async function (venue) {
  return getTimeOfDayForVenue(venue, 'evening');
};

/**
 * Generic function for computing the Date for a venue at a time of day.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @param timeOfDay string what time of day the date should be computed for.
 * @returns {Date} of next venue at timeOfDay.
 */
const getTimeOfDayForVenue = function (venue, timeOfDay) {
  // get the next instance the venue
  let nextVenue = computeNextVenue(
    venue.dayOfWeek,
    venue.startTime,
    venue.endTime,
    venue.timezone
  );

  let startTime = nextVenue.start_time;
  let timezone = venue.timezone;

  // change time based on timeOfDay
  return setTimeOfDayForDate(startTime, timezone, timeOfDay);
};

/**
 * Sets and returns a date when the time set to timeOfDay.
 * @param date to change time for.
 * @param timezone string timezone of the date. needed to set timeOfDay.
 * @param timeOfDay string what time of day to have for the date.
 * @returns {Date} date at timeOfDay.
 */
const setTimeOfDayForDate = function (date, timezone, timeOfDay) {
  // change time based on timeOfDay
  let timeSetter = {
    minute: 0,
    second: 0,
  };
  switch (timeOfDay) {
    case 'morning':
      timeSetter.hour = 9;
      break;
    case 'noon':
      timeSetter.hour = 12;
      break;
    case 'afternoon':
      timeSetter.hour = 15;
      break;
    case 'evening':
      timeSetter.hour = 18;
      break;
  }

  // set timestamp and return.
  let setTimestamp = DateTime.fromJSDate(date)
    .setZone(timezone)
    .set(timeSetter);

  return setTimestamp.toUTC().toJSDate();
};

/**
 * Returns the Date corresponding to the start time of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<Date>} date start time of a venue.
 */
export const startOfVenue = async function (venue) {
  return computeNextVenue(
    venue.dayOfWeek,
    venue.startTime,
    venue.endTime,
    venue.timezone
  ).start_time;
};

/**
 * Returns the Date corresponding to the end time of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<Date>} date end time of a venue.
 */
export const endOfVenue = async function (venue) {
  return computeNextVenue(
    venue.dayOfWeek,
    venue.startTime,
    venue.endTime,
    venue.timezone
  ).end_time;
};

/**
 * Returns the start and end time corresponding to the first instance of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<{}|CancelableRequest<Response<*>>>} promise that contains the venue name, start time, end time, and timezone of the first instance of venue.
 */
export const getFirst = async function (venue) {
  try {
    // query studio api for first instance of venue
    let response = await getFromStudioAPI('venues/firstInstance', {
      venueName: venue.name,
    });

    // parse info and return
    let responseBody = response.body;
    return {
      name: responseBody.name,
      start_time: DateTime.fromISO(responseBody.start_time).toJSDate(),
      end_time: DateTime.fromISO(responseBody.end_time).toJSDate(),
      timezone: responseBody.timezone,
    };
  } catch (error) {
    console.error(`Error in getFirst PL function: ${error}`);
    return {};
  }
};

/**
 * Returns the start and end time corresponding to the last instance of a venue.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<{}|CancelableRequest<Response<*>>>} promise that contains the venue name, start time, end time, and timezone of the last instance of venue.
 */
export const getLast = async function (venue) {
  try {
    // query studio api for first instance of venue
    let response = await getFromStudioAPI('venues/lastInstance', {
      venueName: venue.name,
    });

    // parse info and return
    let responseBody = response.body;
    return {
      name: responseBody.name,
      start_time: DateTime.fromISO(responseBody.start_time).toJSDate(),
      end_time: DateTime.fromISO(responseBody.end_time).toJSDate(),
      timezone: responseBody.timezone,
    };
  } catch (error) {
    console.error(`Error in getLast PL function: ${error}`);
    return {};
  }
};

/**
 * Returns a timestamp for when to execute a script before the next instance of a venue.
 * @param venue object with information about the venue. Contains the following:
 * {
 *  name: string name of venue
 *  description: string description of venue
 *  day_of_week: string day of week venue occurs
 *  start_time: string start time of venue in format HH:MM:SS
 *  end_time: string end time of venue in format HH:MM:SS
 *  timezone: string timezone of start and end times for venue
 * }
 * @param timeBefore object used to compute the time before the venue's start_time:
 * {
 *   hours: number of hours
 *   minutes: number of minutes
 *   seconds: number of seconds
 * }
 * @return {Date}
 */
const before = function (venue, timeBefore) {
  // logic: check to see if the venue is still coming this week (if not send to next week)
  let nextVenue = computeNextVenue(
    venue.dayOfWeek,
    venue.startTime,
    venue.endTime,
    venue.timezone
  );

  // shift time based on timeBefore
  // for before, take the start_time and subtract timeBefore from it
  let shiftedTime = DateTime.fromJSDate(nextVenue.start_time).minus({
    hours: timeBefore.hours,
    minutes: timeBefore.minutes,
    seconds: timeBefore.seconds,
  });

  // return the time that script should trigger
  return shiftedTime.toJSDate();
};

/**
 * TODO: This will not work as expected if time needs to be rounded to be matched.
 * Returns a timestamp for when to execute a script after the next instance of a venue.
 * @param venue object with information about the venue. Contains the following:
 * {
 *  name: string name of venue
 *  description: string description of venue
 *  day_of_week: string day of week venue occurs
 *  start_time: string start time of venue in format HH:MM:SS
 *  end_time: string end time of venue in format HH:MM:SS
 *  timezone: string timezone of start and end times for venue
 * }
 * @param timeAfter object used to compute the time after the venue's end_time:
 * {
 *   hours: number of hours
 *   minutes: number of minutes
 *   seconds: number of seconds
 * }
 * @return {Date}
 */
const after = function (venue, timeAfter) {
  // logic: check to see if the venue is still coming this week (if not send to next week)
  let nextVenue = computeNextVenue(
    venue.dayOfWeek,
    venue.startTime,
    venue.endTime,
    venue.timezone
  );

  // shift time based on timeBefore
  // for after, take the end_time and add time to it
  let shiftedTime = DateTime.fromJSDate(nextVenue.end_time).plus({
    hours: timeAfter.hours,
    minutes: timeAfter.minutes,
    seconds: timeAfter.seconds,
  });

  // return the time that script should trigger
  return shiftedTime.toJSDate();
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
 * @param targetDayOfWeek
 * @param venueStartTime
 * @param venueEndTime
 * @param timezone
 */
const computeNextVenue = function (
  targetDayOfWeek,
  venueStartTime,
  venueEndTime,
  timezone
) {
  // create new DateTime object for the current week in the venue's timezone
  // zero out the time (hours, mins, secs, milliseconds)
  let currentWeekDate = DateTime.now().setZone(timezone).startOf('day');

  // get the number of days to shift date based on when the next venue is
  // note that this is sunday = 0 while luxon is monday = 0
  let targetDayOfWeekIndex = dayOfWeekToIndex(targetDayOfWeek);
  let currDayOfWeekIndex = dayOfWeekToIndex(currentWeekDate.weekdayLong);

  // TODO: something about this incrementing thing is not adding properly
  let nextVenueDayShift = targetDayOfWeekIndex - currDayOfWeekIndex;
  if (nextVenueDayShift < 0) {
    nextVenueDayShift += 7;
  }

  // shift current date
  let nextVenueDate = currentWeekDate.plus({ days: nextVenueDayShift });

  // create new start and end times for the venue
  let [startHours, startMinutes, startSeconds] = venueStartTime.split(':');
  let nextVenueStartTime = nextVenueDate.set({
    hour: startHours,
    minute: startMinutes,
    second: startSeconds,
  });

  let [endHours, endMinutes, endSeconds] = venueEndTime.split(':');
  let nextVenueEndTime = nextVenueDate.set({
    hour: endHours,
    minute: endMinutes,
    second: endSeconds,
  });

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
    start_time: nextVenueStartTime.toUTC().toJSDate(),
    end_time: nextVenueEndTime.toUTC().toJSDate(),
  };
};

/**
 * TODO: refactor the code that's using this to use luxon's indices instead (monday is 0 for luxon)
 * Converts a string day of the week to an integer index.
 * @param dayString
 * @return {number}
 */
const dayOfWeekToIndex = function (dayString) {
  let dayIndex;
  switch (dayString) {
    case 'Sunday':
      dayIndex = 0;
      break;
    case 'Monday':
      dayIndex = 1;
      break;
    case 'Tuesday':
      dayIndex = 2;
      break;
    case 'Wednesday':
      dayIndex = 3;
      break;
    case 'Thursday':
      dayIndex = 4;
      break;
    case 'Friday':
      dayIndex = 5;
      break;
    case 'Saturday':
      dayIndex = 6;
      break;
  }

  return dayIndex;
};
