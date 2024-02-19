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
      description: 'Students committed too few points on their current sprint',
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `Students committed too few points on their current sprint.`,
          people: ['Kapil Garg', 'Grace Wang', 'Linh Ly'],
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
