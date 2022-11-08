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
          message: "A team you mentor, (${ this.project.students.map(student => { return student.name.split(' ')[0] }).join(' and ') }), significantly overworked in the past week (${ this.project.tools.sprintLog.totalPoints.pointsCommitted.total } points spent out of ${ this.project.tools.sprintLog.totalPoints.pointAvailable } points available; <${ this.project.tools.sprintLog.url }|Planning Tool>).\n\nDuring your Planning Meeting with them, try to reflect with them on why they overworked and strategies they can try next time. \n\n These include: \n (1) Reaching out for help when you're spending too long on tasks;\n(2) Scoping down a story mid-week if you're running out of time (e.g., implement one tech slice, instead of 2); and/or\n(3) Deferring stories you can't complete to the next sprint instead of overworking",
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