/**
 * Support students undercommitted
 * TODO: make sure to check for mid-sprint
 */
export default {
  name: 'Undercommitted',
  description: 'Students committed too few points on their sprint log',
  timeframe: 'week',
  repeat: false,
  applicable_set: async function () {
    return this.projects.filter(
      this.whereAll('students', 'role', 'NonPhdStudent')
    );
  }.toString(),
  situation_detector: async function () {
    let isHourBeforeSig = await this.currentlyIs(
      await this.hoursBeforeVenue(
        await this.venues.find(this.where('kind', 'SigMeeting')),
        1
      )
    );

    let isUnderPoints =
      this.project.tools.sprintLog.totalPoints.pointsCommitted.total <
      0.9 * this.project.tools.sprintLog.totalPoints.pointAvailable;

    return isHourBeforeSig && isUnderPoints;
  }.toString(),
  strategies: [
    {
      name: 'Undercommitted',
      description: 'Students committed too few points on their current sprint',
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `It looks like ${this.project.name} (${this.project.students
            .map((student) => {
              return student.name.split(' ')[0];
            })
            .join(' and ')}) is under committed on points (${
            this.project.tools.sprintLog.totalPoints.pointsCommitted.total
          } points committed out of ${
            this.project.tools.sprintLog.totalPoints.pointAvailable
          } points available; <${
            this.project.tools.sprintLog.url
          }|Sprint Log>).`,
          people: ['Kapil Garg'],
          opportunity: async function opportunity() {
            return await this.hoursBeforeVenue(
              await this.venues.find(this.where('kind', 'SigMeeting')),
              1
            );
          }.toString(),
        });
      }.toString(),
    },
  ],
};
