/**
 * This module contains predicates for the programming language.
 */
import { DateTime } from "luxon";

/*
 Datetime predicates.
 */
/**
 * Returns true if today is the day of the venue passed as input.
 * @param venue object that contains the name of the venue, start_time, end_time, and day of week.
 * @returns {Promise<boolean>} boolean whether today is the day of the venue.
 */
export const isDayOfVenue = async (venue) => {
  let todayWeekday = DateTime.now().weekdayLong;
  return venue.day_of_week.trim().toLowerCase() === todayWeekday.trim().toLowerCase();
};

/**
 * Returns true if today is the day of the passed in date.
 * @param date date to check if today is the same day of.
 * @returns {Promise<boolean>} true if today is the day of date.
 */
export const isDayOf = async (date) => {
  let todayWeekday = DateTime.now().weekdayLong;
  let dateWeekday = DateTime.fromJSDate(date).weekdayLong;
  return todayWeekday.trim().toLowerCase() === dateWeekday.trim().toLowerCase();
};

/**
 * Returns true if today is same week of the passed in date.
 * @param date date to check if today is the same week of.
 * @returns {Promise<boolean>} true if today is the week of date.
 */
export const isWeekOf = async (date) => {
  let todayWeek = DateTime.now().weekNumber;
  let dateWeek = DateTime.fromJSDate(date).weekNumber;
  return todayWeek === dateWeek;
};

/*
 Filtering predicates.
 */

/**
 * TODO: doesn't work with date right now since date is converted into a string.
 * Returns a generic matching predicate for an object property and value.
 * @param objPropertySpecifier string object property to check. Sub-properties can be accessed with "." (e.g., "sigHead.name")
 * @param value object value to check for. currently supports string, boolean, number, and array.
 * @returns {Function} predicate that will check if target.objPropertySpecifier equals value.
 */
export const where = (objPropertySpecifier, value) => {
  // check if the input value is an array
  if (Array.isArray(value)) {
    return new Function(
      "target",
      String.raw`return ${ JSON.stringify(value) }.includes(target.${ objPropertySpecifier })`
    );
  }

  // wrap value if it's a string
  let wrappedValue;
  if (typeof value === "string") {
    wrappedValue = `"${ value }"`;
  } else {
    wrappedValue = value;
  }

  // return a new predicate
  return new Function(
    "target",
    `return target.${ objPropertySpecifier } === ${ wrappedValue }`
  );
};

/**
 * Returns a predicate that checks if all values in a list match a value.
 * @param listKey string object property that contains a list to check values for.
 * @param objPropertySpecifier string object property to check. Sub-properties can be accessed with "." (e.g., "sigHead.name")
 * @param value object value to check for.
 * @returns {Function} predicate that will check if all objPropertySpecifier of target.listKey equals value.
 */
export const whereAll = (listKey, objPropertySpecifier, value) => {
  // generate inner predicate
  let innerPredicate = where(objPropertySpecifier, value);

  // return a new predicate
  return new Function(
    "target",
    `return target.${ listKey }.every(${ innerPredicate })`
  );
};

/**
 * Returns a predicate that checks if any of the values in a list match a value.
 * @param listKey string object property that contains a list to check values for.
 * @param objPropertySpecifier string object property to check. Sub-properties can be accessed with "." (e.g., "sigHead.name")
 * @param value object value to check for.
 * @returns {Function} predicate that will check if any of objPropertySpecifier of target.listKey equals value.
 */
export const whereSome = (listKey, objPropertySpecifier, value) => {
  // generate inner predicate
  let innerPredicate = where(objPropertySpecifier, value);

  // return a new predicate
  return new Function(
    "target",
    `return target.${ listKey }.some(${ innerPredicate })`
  );
};