/**
 * This module contains predicates for the programming language.
 */
import { DateTime } from 'luxon';
import { floorDateToNearestFiveMinutes } from '../../imports/utils.js';

/*
 TODO:
 - add a isDaysBefore (and similar for other quantities) predicate
 */

/*
 Datetime predicates.
 */
/**
 * Returns true if today is the day of the venue passed as input.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<boolean>} boolean whether today is the day of the venue.
 */
export const isDayOfVenue = async function (venue) {
  // get the current weekday in the timezone of the venue
  let todayWeekday = DateTime.now().setZone(venue.timezone).weekdayLong;
  return (
    venue.dayOfWeek.trim().toLowerCase() === todayWeekday.trim().toLowerCase()
  );
};

/**
 * Returns true if today is the day of the passed in date.
 * @param date date in UTC TZ to check if today is the same day of.
 * @returns {Promise<boolean>} true if today is the day of date.
 */
export const isDayOf = async function (date) {
  let todayDate = DateTime.now().startOf('day');
  let targetDate = DateTime.fromJSDate(date).startOf('day');

  return (
    todayDate.hasSame(targetDate, 'year') &&
    todayDate.hasSame(targetDate, 'month') &&
    todayDate.hasSame(targetDate, 'day')
  );
};

/**
 * Returns true if today is same week of the passed in date.
 * @param date date in UTC TZ to check if today is the same week of.
 * @returns {Promise<boolean>} true if today is the week of date.
 */
export const isWeekOf = async function (date) {
  let todayWeek = DateTime.now().weekNumber;
  let dateWeek = DateTime.fromJSDate(date).weekNumber;
  return todayWeek === dateWeek;
};

/**
 * Returns true if the current date/time is equal to the date passed in.
 * @param date date in UTC TZ to check if today is the same week of.
 * @returns {Promise<boolean>} true if the current time is the same as date.
 */
export const currentlyIs = async function (date) {
  // round testing date to nearest 5 minutes before comparing
  let currDate = floorDateToNearestFiveMinutes(new Date());
  return currDate.getTime() === date.getTime();
};

/*
 Filtering predicates.
 TODO:
 - think about chaining predicates (this field and that field)
 - consider: what if where and whereAll were Array extensions?
 */

/**
 * TODO: doesn't work with date right now since date is converted into a string.
 * Returns a generic matching predicate for an object property and value.
 * @param objPropertySpecifier string object property to check. Sub-properties can be accessed with "." (e.g., "sigHead.name")
 * @param value object value to check for. currently supports string, boolean, number, and array.
 * @returns {Function} predicate that will check if target.objPropertySpecifier equals value.
 */
export const where = function (objPropertySpecifier, value) {
  // check if the input value is an array
  if (Array.isArray(value)) {
    return new Function(
      'target',
      String.raw`return ${JSON.stringify(
        value
      )}.includes(target.${objPropertySpecifier})`
    );
  }

  // wrap value if it's a string
  let wrappedValue;
  if (typeof value === 'string') {
    wrappedValue = `"${value}"`;
  } else {
    wrappedValue = value;
  }

  // return a new predicate
  return new Function(
    'target',
    `return target.${objPropertySpecifier} === ${wrappedValue}`
  );
};

/**
 * Returns a predicate that checks if all values in a list match a value.
 * @param listKey string object property that contains a list to check values for.
 * @param objPropertySpecifier string object property to check. Sub-properties can be accessed with "." (e.g., "sigHead.name")
 * @param value object value to check for.
 * @returns {Function} predicate that will check if all objPropertySpecifier of target.listKey equals value.
 */
export const whereAll = function (listKey, objPropertySpecifier, value) {
  // generate inner predicate
  let innerPredicate = where(objPropertySpecifier, value);

  // return a new predicate
  return new Function(
    'target',
    `return target.${listKey}.every(${innerPredicate})`
  );
};

/**
 * Returns a predicate that checks if any of the values in a list match a value.
 * @param listKey string object property that contains a list to check values for.
 * @param objPropertySpecifier string object property to check. Sub-properties can be accessed with "." (e.g., "sigHead.name")
 * @param value object value to check for.
 * @returns {Function} predicate that will check if any of objPropertySpecifier of target.listKey equals value.
 */
export const whereSome = function (listKey, objPropertySpecifier, value) {
  // generate inner predicate
  let innerPredicate = where(objPropertySpecifier, value);

  // return a new predicate
  return new Function(
    'target',
    `return target.${listKey}.some(${innerPredicate})`
  );
};

// TODO: (maybe) predicates for searching sprint log? would the above not be enough?
