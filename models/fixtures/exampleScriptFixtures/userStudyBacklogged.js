/**
 * Siloing-Tech
 */
export default {
  name: 'UserStudyBacklogged',
  description: 'User Study Backlogged',
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

    // TODO: this should work, but check what happens when this runs at the start of a new sprint / week
    let isUserStudyBacklogged = this.project.tools.sprintLog.stories.some(
      (story) =>
        story.tasks.some((task) => {
          return (
            (task.description.includes('user') ||
              task.description.includes('study') ||
              task.description.includes('testing')) &&
            task.taskStatus === 'backlogged'
            // // task.taskStatus === 'in-progress' ||
            // task.taskStatus === '' ||
            // task.taskStatus === null)
          );
        })
    );
    return isMorningOfSig && isUserStudyBacklogged;
  }.toString(),
  strategies: [
    {
      name: 'User Study Backlogged',
      description:
        'User Study Backlogged: students have user study tasks backlogged',
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `User Study Backlogged: students have user study tasks backlogged.`,
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
