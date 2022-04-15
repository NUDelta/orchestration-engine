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