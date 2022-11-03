/**
 * Supporting students in fully planning their sprints.
 */
export default {
  name: "Scoping sprint plans to time constraints",
  description: "Students should aim to plan their sprints within the time constraints they are given. If over points, they may need help re-scoping the deliverables they have for their sprint and/or slicing down on some of their stories to meeting their deliverables within the points they have available.",
  timeframe: "week",
  repeat: false,
  applicable_set: (async function() {
    return this.projects.filter(
      this.whereAll("students", "role", "NonPhdStudent")
    );
  }).toString(),
  situation_detector: (async function() {
    let isCurrentlySig = await this.currentlyIs(
      await this.startOfVenue(
        await this.venues.find(this.where("kind", "SigMeeting"))
      )
    );

    let isOverPoints = this.project.tools.sprintLog.totalPoints.pointsCommitted.total >=
      1.1 * this.project.tools.sprintLog.totalPoints.pointAvailable;
    return isCurrentlySig && isOverPoints;
  }).toString(),
  strategies: [
    {
      name: "Discuss students being over points",
      description: "Discuss with your students for why they are over points.",
      strategy_function: (async function () {
        return await this.messagePeople({
          message: "It looks like ${ this.project.name } (${ this.project.students.map(student => { return student.name.split(' ')[0] }).join(' and ') }) is over points (${ this.project.tools.sprintLog.totalPoints.pointsCommitted.total } points committed out of ${ this.project.tools.sprintLog.totalPoints.pointAvailable } points available; <${ this.project.tools.sprintLog.url }|Sprint Log>).\n\nDuring SIG, try to see if there are ways they can re-scope their sprint. Some ways to do this include: \n-slicing down on deliverables (e.g., 1 user test instead of 2) \n-finding ways to get help on things if they are taking a long time (e.g., from peers on tech) \n-re-planning by deferring stories to the following sprint if it's not possible within the current one, but still doing a set of stories that advance their research understanding",
          people: [this.project.sigHead.name],
          opportunity: (async function () {
            return await this.startOfVenue(
              await this.venues.find(this.where("kind", "SigMeeting"))
            );
          }).toString()
        })
      }).toString()
    },
  ]
};