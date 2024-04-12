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
    let isMorningOfSig = await this.currentlyIs(
      await this.morningOfVenue(
        await this.venues.find(this.where('kind', 'SigMeeting'))
      )
    );

    let isOverPoints =
      this.project.tools.sprintLog.totalPoints.pointsCommitted.total >=
      1.1 * this.project.tools.sprintLog.totalPoints.pointAvailable;

    return isMorningOfSig && isOverPoints;
  }.toString(),
  strategies: [
    {
      name: 'Overcommitted',
      description: 'Students committed too many points on their current sprint',
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `Students committed too many points on their current sprint (${this.project.tools.sprintLog.points
            .map((student) => {
              let currStudent = student.name;
              let currStudentHoursSpent =
                student.pointsCommitted.total.toFixed(2);
              let currStudentHoursAvail = student.pointsAvailable.toFixed(2);
              return `${currStudent}: ${currStudentHoursSpent} points committed vs. ${currStudentHoursAvail} points available`;
            })
            .join('; ')}; Sprint Log: ${this.project.tools.sprintLog.url}).`,
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
