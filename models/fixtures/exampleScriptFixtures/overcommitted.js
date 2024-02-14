/**
 * Support students overcommitted
 * TODO: make sure to check for mid-sprint
 */
export default {
  name: 'Overcommitted',
  description: 'Students committed too many points on their sprint log',
  timeframe: 'week',
  repeat: false,
  applicable_set: async function applicableSet() {
    return this.projects.filter(
      this.whereAll('students', 'role', 'NonPhdStudent')
    );
  }.toString(),
  situation_detector: async function situationDetector() {
    let isHourBeforeSig = await this.currentlyIs(
      await this.hoursBeforeVenue(
        await this.venues.find(this.where('kind', 'SigMeeting')),
        1
      )
    );

    let isOverPoints =
      this.project.tools.sprintLog.totalPoints.pointsCommitted.total >=
      1.1 * this.project.tools.sprintLog.totalPoints.pointAvailable;

    return isHourBeforeSig && isOverPoints;
  }.toString(),
  strategies: [
    {
      name: 'Overcommitted',
      description: 'Students committed too many points on their current sprint',
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `It looks like ${this.project.name} (${this.project.students
            .map((student) => {
              return student.name.split(' ')[0];
            })
            .join(' and ')}) is over points (${
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
