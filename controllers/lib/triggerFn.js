import { studioAPIUrl } from '../../index.js';
import { DateTime } from 'luxon';

// TODO: consider returning a time-frame for each of these scripts
// e.g., +- 10 mins from the trigger date (though, this should be dependent on the context)
// during: up to 10 mins after the venue has started
// before: up to 10 mins before the timestamp
// after: up to 10 mins after the timestamp

// TODO: if using luxon, good to shift towards its monday-0-index instead of my sunday-0-index

// TODO: this might be messing up due to daylight savings time from using the default date in the studio api
/**
 * Returns a timestamp for when to execute a script during the next instance of a venue.
 * TODO: to support DST, start_time and end_time should be strings like HH:MM, and also timezone.
 * @param venue object with information about the venue. Contains the following:
 * {
 *  name: string name of venue
 *  description: string description of venue
 *  day_of_week: string day of week venue occurs
 *  start_time: string start time of venue in format HH:MM:SS
 *  end_time: string end time of venue in format HH:MM:SS
 *  timezone: string timezone of start and end times for venue
 * }
 * @return {Promise<Date>}
 */
export const during = async function (venue) {
  // logic: check to see if the venue is still coming this week (if not send to next week)
  let nextVenue = computeNextVenue(
    venue.day_of_week,
    venue.start_time,
    venue.end_time,
    venue.timezone
  );

  // return the time that script should trigger
  // for during, script triggers at the beginning of the venue (so, the start time)
  return nextVenue.start_time;
};

/**
 * Returns a timestamp for when to execute a script before the next instance of a venue.
 * TODO: support something like "noon the day before"
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
 * @return {Promise<Date>}
 */
export const before = async function (venue, timeBefore) {
  // logic: check to see if the venue is still coming this week (if not send to next week)
  let nextVenue = computeNextVenue(
    venue.day_of_week,
    venue.start_time,
    venue.end_time,
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
 * TODO: support something like "noon the day after a venue"
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
 * @return {Promise<Date>}
 */
export const after = async function (venue, timeAfter) {
  // logic: check to see if the venue is still coming this week (if not send to next week)
  let nextVenue = computeNextVenue(
    venue.day_of_week,
    venue.start_time,
    venue.end_time,
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
// TODO (BUG): a venue that occurs the day before when the script is activated might break it
// Ex: Status Update script for "2023-01-27T18:00:00.000Z" but SIG meeting is "2023-01-26T21:30:00.000Z"
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
  let currentWeekDate = DateTime.now().setZone(timezone);

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
 * Converts a string day of the week to an integer index.
 *
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
