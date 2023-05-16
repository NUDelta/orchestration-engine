/**
 * Supporting students in planning for end-of-quarter deliverables.
 */
export default {
  name: 'Planning and scoping end-of-quarter deliverables',
  description:
    "As the quarter closes, we want students to reflect on what they have learned about their research work. At the last SIG meeting for the quarter, make sure we discuss what each student's EOQ deliverables will be.",
  timeframe: 'week',
  repeat: false,
  applicable_set: async function () {
    return this.socialStructures.filter(this.where('kind', 'SigStructure'));
  }.toString(),
  situation_detector: async function () {
    return await this.isDayOf(
      (
        await this.getLast(this.venues.find(this.where('kind', 'SigMeeting')))
      ).start_time
    );
  }.toString(),
  strategies: [
    {
      name: "Discuss students' end-of-quarter deliverable plans",
      description:
        'Help your students plan EOQ deliverables that showcase the changes in their understanding of the research problem from this term.',
      strategy_function: async function () {
        return await this.messagePeople({
          message:
            'Today is the last SIG meeting of the quarter! During SIG, try to help your students come up with end-of-quarter deliverables that show their new research understanding from this quarter, such as by asking what parts of their practical and research canvas have changed the most this quarter and how they would show this through a research talk or paper. If needed, also help them slice down so that they can finish their deliverables in a manageable amount of time by next week.',
          people: [this.socialStructure.sigHead.name],
          opportunity: async function () {
            return await this.minutesBeforeVenue(
              await this.venues.find(this.where('kind', 'SigMeeting')),
              30
            );
          }.toString(),
        });
      }.toString(),
    },
  ],
};
