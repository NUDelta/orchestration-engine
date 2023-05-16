/**
 * Remind students to discuss status update with their mentor 1 week before it.
 * @type {EnforceDocument<T & Document<any, any, any>, {}, {}>}
 */
export default {
  name: "Today's Status Update",
  description:
    'Before the start of Studio, let the studio head know who has status update.',
  timeframe: 'week',
  repeat: false,
  target: async function () {
    return await this.getNonPhdProjects();
  }.toString(),
  detector: async function () {
    // get date 1 week before status update date
    let statusUpdateDate = await this.getStatusUpdateDate();

    // check if current month and date equal the status update date of the project
    let currDate = new Date();
    return (
      currDate.getDate() === statusUpdateDate.getDate() &&
      currDate.getMonth() === statusUpdateDate.getMonth() &&
      currDate.getFullYear() === statusUpdateDate.getFullYear()
    );
  }.toString(),
  actionable_feedback: [
    // TODO: also support notification at next office hours as an alternate strategy
    {
      feedback_message: '${ this.project } has their status update today.',
      feedback_opportunity: async function () {
        return await this.before(await this.venue('Studio'), {
          hours: 0,
          minutes: 30,
          seconds: 0,
        });
      }.toString(),
      feedback_outlet: async function () {
        return await this.sendSlackMessageToFacultyMentor();
      }.toString(),
    },
  ],
};
