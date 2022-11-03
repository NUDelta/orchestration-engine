/**
 * Helping students use venues throughout the week to progress their research work.
 */
export default {
  name: "Using venues throughout the week for progressing research work",
  description: "Students have multiple opportunities to get support from their mentors and their peers for their work.",
  timeframe: "week",
  repeat: true,
  applicable_set: (async function() {
    return this.socialStructures.filter(
      this.where("name",
        [
          "Networked Orchestration Technologies",
          "Collective Experiences",
          "Readily Available Learning Experiences",
          "Contextually-Aware Metacognitive Practice"
        ]
      )
    );
  }).toString(),
  situation_detector: (async function() {
    return true;
  }).toString(),
  strategies: [
    {
      name: "Have students send deliverables before SIG meeting",
      description: "Help students articulate their updated understanding of the research work, and give mentors the opportunity to review deliverables before the SIG meeting later that day.",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "We have SIG later today! Please share with your SIG head (<@${ this.socialStructure.sigHead.slackId }>) the following:\n (1) links/videos/etc to your completed deliverables this week (or a partial slice of them); \n (2) what risk(s) these deliverables attemped to address; and \n (3) what new understanding, risks, and/or questions that deliverable has surfaced that you plan to work on next.",
          sigName: this.socialStructure.name,
          opportunity: (async function () {
            return await this.morningOfVenue(
              await this.venues.find(this.where("kind", "SigMeeting"))
            );
          }).toString()
        })
      }).toString()
    },
    {
      name: "Sharing takeaways after a SIG meeting",
      description: "Help mentors see the students' revised understanding of project risks and planned deliverables after a SIG meeting.",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "Great work at SIG today! When possible, please share with <@${ this.socialStructure.sigHead.slackId }> in a thread reply:\n(1) what are your main takeaways from SIG; \n(2) what are your revised risks and deliverables for the coming week?",
          sigName: this.socialStructure.name,
          opportunity: (async function () {
            return await this.hoursAfterVenue(
              await this.venues.find(this.where("kind", "SigMeeting")),
              1
            );
          }).toString()
        })
      }).toString()
    },
    // TODO: this will currently fail if there is not an office hours venue
    // TODO: edge case -- what about students who have office hours at different times? (this code will only run 1x for the first office hours)
    {
      name: "Planning to attend office hours",
      description: "If students plan to attend office hours, have them send any artifacts that they would like their mentor to look at beforehand.",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "We have office hours later today! Are you planning to attend? If so, let <@${ this.socialStructure.sigHead.slackId }> know and send them: \n (1) what project risk you plan to work on during Office Hours; and \n(2) any artifacts that you would like them to try to look at before the session (e.g., a draft).",
          sigName: this.socialStructure.name,
          opportunity: (async function () {
            return await this.morningOfVenue(
              await this.venues.find(this.where("kind", "OfficeHours"))
            );
          }).toString()
        })
      }).toString()
    },
    {
      name: "Using LIP and PR during Studio",
      description: "Before Studio meeting, have students check-in with their mentors on what LIP and PR they plan to work on during Studio.",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "Before DTR later today, check-in with <@${ this.socialStructure.sigHead.slackId }> about: \n(1) what project risk and slice of a <https://docs.google.com/spreadsheets/d/1LTKNnT5WhedVxc9XJQOTHm8BaQj2wlQvPqr_Yqcuo7Q/edit#gid=27941612|LIP module> you plan to work on during Mysore; and \n(2) what risk you plan to get help on during Pair Research.",
          sigName: this.socialStructure.name,
          opportunity: (async function () {
            return await this.morningOfVenue(
              await this.venues.find(this.where("kind", "StudioMeeting"))
            );
          }).toString()
        })
      }).toString()
    },
  ]
};