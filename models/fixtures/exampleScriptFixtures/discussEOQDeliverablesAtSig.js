/**
 * Supporting students in planning for end-of-quarter deliverables.
 */
export default {
  name: "Planning and scoping end-of-quarter deliverables",
  description: "As the quarter closes, we want students to reflect on what they have learned about their research workAt the last SIG meeting for the quarter, make sure we discuss what each student's EOQ deliverables will be.",
  timeframe: "week",
  repeat: false,
  // TODO: have this go to SIG's maybe?
  applicable_set: (async function() {
    return this.projects;
  }).toString(),
  situation_detector: (async function() {
    return await this.isDayOf(
      await this.daysBefore(
        (await this.getLast(this.venues.find(this.where("kind", "SigMeeting")))).start_time, 1)
    );
  }).toString(),
  strategies: [
    {
      name: "Prepare to discuss end-of-quarter deliverables at next SIG",
      description: "Prompt students to review their EOQ checklists and their research canvases to think about what shape their EOQ deliverables may take.",
      // TODO: add EOQ check-list, rrc, and prc documents to studio api and PL (no need to scrape -- URLs are fine)
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "Tomorrow is our last SIG meeting of the quarter! Now is a good time to think about how you'd like to wrap up the quarter, and what your end-of-quarter deliverables will be. \n\n Before our meeting, try to: (1) read through the end-of-quarter check-list; and (2) read through your current project canvases (<this.tools.prc.url|Practical Research Canvas>; <this.tools.rrc.url|Research Research Canvas>) and think about what you would want to show in a video or paper that demonstrates the understanding of your research problem that you've built this quarter.",
          projectName: this.project.name,
          opportunity: (async function () {
            return await this.daysBeforeVenue(
              await this.venues.find(this.where("kind", "SigMeeting")), 1
            );
          }).toString()
        })
      }).toString()
    },
    {
      // TODO: BUG -- this may trigger twice rn since the applicable set is on projects
      name: "Discuss students' end-of-quarter deliverable plans",
      description: "Help your students plan EOQ deliverables that showcase the changes in their understanding of the research problem from this term.",
      strategy_function: (async function () {
        return await this.messagePeople({
          message: "Today is the last SIG meeting of the quarter! During SIG, try to help your students come up with end-of-quarter deliverables that show their new research understanding from this quarter. One way to do this might be to ask what parts of their practical and research canvas have changed the most this quarter. If needed, also help them slice down so that they can finish their deliverables in a manageable amount of time by next week.",
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

