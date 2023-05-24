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
      name: 'Overcommitted',
      description: 'Students committed too few points on their sprint log',
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `It looks like ${this.project.name} (${this.project.students
            .map((student) => {
              return student.name.split(' ')[0];
            })
            .join(' and ')}) is overly focused on a Category <${
            this.project.tools.sprintLog.url
          }|Sprint Log>).`,
          people: ['Grace Wang', 'Jordan Checkoff'],
          opportunity: async function opportunity() {
            return await this.morningOfVenue(
              await this.venues.find(this.where('kind', 'SigMeeting'))
            );
          }.toString(),
        });
      }.toString(),
    },
  ],
};
