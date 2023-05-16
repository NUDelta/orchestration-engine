/**
 * Supporting students in fully planning their sprints.
 */
export default {
  name: 'Fully planning sprints',
  description:
    "Students should aim to plan most of their sprints so that we can discuss plans during SIG meetings. They may struggle to do so if they don't know their project risks, don't know how to setup stories for the risks, are stuck and need help but don't know from where, etc.",
  timeframe: 'week',
  repeat: false,
  applicable_set: async function () {
    return this.projects.filter(
      this.whereAll('students', 'role', 'NonPhdStudent')
    );
  }.toString(),
  situation_detector: async function () {
    let isCurrentlySig = await this.currentlyIs(
      await this.startOfVenue(
        await this.venues.find(this.where('kind', 'SigMeeting'))
      )
    );

    let isUnderPoints =
      this.project.tools.sprintLog.totalPoints.pointsCommitted.total <
      0.9 * this.project.tools.sprintLog.totalPoints.pointAvailable;
    return isCurrentlySig && isUnderPoints;
  }.toString(),
  strategies: [
    {
      name: 'Discuss students being under points',
      description: 'Discuss with your students for why they are under points.',
      strategy_function: async function () {
        return await this.messagePeople({
          message:
            "It looks like ${ this.project.name } (${ this.project.students.map(student => { return student.name.split(' ')[0] }).join(' and ') }) is under points (${ this.project.tools.sprintLog.totalPoints.pointsCommitted.total } points committed out of ${ this.project.tools.sprintLog.totalPoints.pointAvailable } points available; <${ this.project.tools.sprintLog.url }|Sprint Log>).\n\nDuring SIG, try to see if they are struggling with the planning process. Some common issues can include: \n-not knowing project risks \n-don't know the appropriate stories or tasks for project risks \n-are blocked on something, but don't know where to get help",
          people: [this.project.sigHead.name],
          opportunity: async function () {
            return await this.startOfVenue(
              await this.venues.find(this.where('kind', 'SigMeeting'))
            );
          }.toString(),
        });
      }.toString(),
    },
  ],
};
