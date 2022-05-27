/**
 * Support students in planning a Status Update for their project.
 */
export default {
  name: "Support students in planning a Status Update for their project",
  description: "Students each get 1 Status Update opportunity per quarter where they can get help on something from an entire community. Being a very limited resource, this requires students to plan how to use the venue carefully so that are benefiting from the feedback that an entire community can give.",
  timeframe: "week",
  repeat: false,
  applicable_set: (async function() {
    return this.projects.filter(
      this.whereAll("students", "role", "NonPhdStudent")
    );
  }).toString(),
  situation_detector: (async function() {
    return await this.isDayOf(
      await this.weeksBefore(this.project.statusUpdateDate, 1)
    );
  }).toString(),
  strategies: [
    {
      name: "Remind student(s) to begin planning for Status Update",
      description: "Prompt student to start planning their Status Update and share plan with their mentor",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "Your status update is a week from today! It's a good opportunity to get help from the entire community to progress your research work. Try to plan an activity that will benefit most from this opportunity, and discuss it with your mentor--<@${ this.project.sigHead.slackId }>--over the next week during during SIG and/or Office Hours",
          projectName: this.project.name,
          opportunity: (async function () {
            return await this.startOfVenue(
              await this.venues.find(this.where("name", "Studio Meeting"))
            );
          }).toString()
        })
      }).toString()
    },
    {
      name: "Check in on your student's preparation for Status Update",
      description: "Discuss how your students are planning to use Status Update later this week.",
      strategy_function: (async function () {
        return await this.messagePeople({
          message: "Your student(s), ${ this.project.students.map(student => { return student.name }).join(' and ') }, have a Status Update this week. During SIG, try to check in on their Status Update plan and see if they might need any support or feedback.",
          people: [this.project.sigHead.name],
          opportunity: (async function () {
            return await this.minutesBeforeVenue(
              await this.venues.find(this.where("kind", "SigMeeting")), 30
            );
          }).toString()
        })
      }).toString()
    },
  ]
};