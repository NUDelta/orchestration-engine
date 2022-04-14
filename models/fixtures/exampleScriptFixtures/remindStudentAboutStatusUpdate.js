/**
 * Remind students to discuss status update with their mentor 1 week before it.
 * @type {EnforceDocument<T & Document<any, any, any>, {}, {}>}
 */
export default {
  name: "Reminder for Status Update",
  description: "Students should plan to discuss their status update plan with mentors.",
  timeframe: "week",
  repeat: false,
  target: (async function() {
    return await this.getNonPhdProjects();
  }).toString(),
  detector: (async function() {
    // get date 1 week before status update date
    let statusUpdateDate = await this.getStatusUpdateDate();
    let shiftedDate = new Date(statusUpdateDate);
    shiftedDate.setDate(shiftedDate.getDate() - 7);

    // check if current month and date equal shifted date
    let currDate = new Date();
    return (currDate.getDate() === shiftedDate.getDate()) &&
      (currDate.getMonth() === shiftedDate.getMonth()) &&
      (currDate.getFullYear() === shiftedDate.getFullYear());
  }).toString(),
  actionable_feedback: [
    // TODO: also support notification at next office hours as an alternate strategy
    {
      feedback_message: "You have a status update in 1 week! Make sure to meet with your mentor to discuss your plan.",
      feedback_opportunity: (async function () {
        return await this.during(await this.venue("Studio"));
      }).toString(),
      feedback_outlet: (async function () {
        return await this.sendSlackMessageForProject();
      }).toString()
    }
  ]
};