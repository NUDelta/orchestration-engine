/**
 * Supporting students in planning for end-of-quarter deliverables.
 */
export default {
  name: "Preparing for EOQ deliverables by reading through checklist",
  description: "As the quarter closes, we want students to reflect on what they have learned about their research workAt the last SIG meeting for the quarter, make sure we discuss what each student's EOQ deliverables will be.",
  timeframe: "week",
  repeat: false,
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
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "Tomorrow is our last SIG meeting of the quarter! Now is a good time to think about how you'd like to wrap up the quarter, and what your end-of-quarter deliverables will be. \n\n Before our meeting, try to: (1) read through the <${ this.project.tools.eoqChecklist.url }|end-of-quarter check-list> and your self-assessments (${ this.project.students.map(student => { return '<' + student.tools.eoqSelfAssessment.url+ '|' + student.name.split(' ')[0] + '`s EOQ Self-Assessment>'}).join('; ') }) to help plan your final sprint; (2) read through your current project canvases (<${ this.project.tools.practicalResearchCanvas.url }|Practical Research Canvas>; <${ this.project.tools.researchResearchCanvas.url }|Research Research Canvas>) and think about what sections of it you have advanced this quarter; and (3) think about how you would demonstrate this learning through a research talk or paper.",
          projectName: this.project.name,
          opportunity: (async function () {
            return await this.daysBeforeVenue(
              await this.venues.find(this.where("kind", "SigMeeting")), 1
            );
          }).toString()
        })
      }).toString()
    }
  ]
};

