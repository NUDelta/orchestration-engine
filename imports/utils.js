/**
 * Floors date down to nearest 5 minutes.
 * From: https://stackoverflow.com/a/10789415
 * @param currDate
 * @return {Date}
 */
export const floorDateToNearestFiveMinutes = (currDate) => {
  let coeff = 1000 * 60 * 5;
  return new Date(Math.floor(currDate.getTime() / coeff) * coeff);
};

/**
 * Converts a space-separated string into camelCase.
 * Based on: https://stackoverflow.com/a/52551910/4375668
 * @param str string to convert to camel case, such as: "helloWorld again"
 * @returns {string} str in camel case, such as: "helloWorldAgain"
 */
export const camelize = (str) => {
  return str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};