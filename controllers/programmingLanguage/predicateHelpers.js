/**
 * This module contains predicates for the programming language.
 */
import { DateTime } from "luxon";

/*
 Datetime Predicates.
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