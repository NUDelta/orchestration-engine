/**
 * Support students undercommitted
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
    let isMorningOfSig = await this.currentlyIs(
      await this.morningOfVenue(
        await this.venues.find(this.where('kind', 'SigMeeting'))
      )
    );

    let isUnderPoints =
      this.project.tools.sprintLog.totalPoints.pointsCommitted.total <
      0.9 * this.project.tools.sprintLog.totalPoints.pointAvailable;

    return isMorningOfSig && isUnderPoints;
  }.toString(),
  strategies: [
    {
      name: 'Undercommitted',
      description: 'Students committed too few points on their sprint log',
      strategy_function: async function () {
        return await this.presentInDiagnosisTool({
          message: `It looks like ${this.project.name} (${this.project.students
            .map((student) => {
              return student.name.split(' ')[0];
            })
            .join(' and ')}) is under points (${
            this.project.tools.sprintLog.totalPoints.pointsCommitted.total
          } points committed out of ${
            this.project.tools.sprintLog.totalPoints.pointAvailable
          } points available; <${
            this.project.tools.sprintLog.url
          }|Sprint Log>).`,
          projectName: this.project.name,
          opportunity: async function () {
            return await this.morningOfVenue(
              await this.venues.find(this.where('kind', 'SigMeeting'))
            );
          }.toString(),
        });
      }.toString(),
    },
  ],
};
