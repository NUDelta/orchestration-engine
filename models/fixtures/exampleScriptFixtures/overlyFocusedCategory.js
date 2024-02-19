/**
 * Overly focused on one category
 */
export default {
  name: 'overlyFocusCategory',
  description: 'Students is focusing almost completely on one category',
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

    let isOverlyFocused =
      this.project.tools.sprintLog.totalPoints.pointsCommitted.technology >=
        0.93 * this.project.tools.sprintLog.totalPoints.pointsCommitted.total ||
      this.project.tools.sprintLog.totalPoints.pointsCommitted.design >=
        0.93 * this.project.tools.sprintLog.totalPoints.pointsCommitted.total ||
      this.project.tools.sprintLog.totalPoints.pointsCommitted.research >=
        0.93 * this.project.tools.sprintLog.totalPoints.pointsCommitted.total;

    return isMorningOfSig && isOverlyFocused;
  }.toString(),
  strategies: [
    {
      name: 'Overly focused',
      description:
        "Students' sprint plans are heavily focused on one part of D, T, or R",
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `Students' sprint plans are heavily focused on one part of D, T, or R.`,
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
