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
    let isCurrentlySig = await this.currentlyIs(
      await this.morningOfVenue(
        await this.venues.find(this.where('kind', 'SigMeeting'))
      )
    );
    let isUserStudyBacklogged = this.project.tools.sprintLog.stories.some(
      (story) =>
        story.tasks.some((task) => {
          return (
            (task.description.includes('user') ||
              task.description.includes('study') ||
              task.description.includes('testing')) &&
            (task.taskStatus === 'backlogged' ||
              task.taskStatus === 'in-progress' ||
              task.taskStatus === '' ||
              task.taskStatus === null)
          );
        })
    );
    return isCurrentlySig && isUserStudyBacklogged;
  }.toString(),
  strategies: [
    {
      name: 'User Study Backlogged',
      description: 'User Study Backlogged',
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `It looks like ${this.project.name} (${this.project.students
            .map((student) => {
              return student.name.split(' ')[0];
            })
            .join(' and ')})'s userstudy is backlogged <${
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
