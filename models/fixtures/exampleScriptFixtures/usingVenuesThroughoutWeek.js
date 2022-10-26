/**
 * Helping students use venues throughout the week to progress their research work.
 */
export default {
  name: "Using venues throughout the week for progressing research work",
  description: "Students have multiple opportunities to get support from their mentors and their peers for their work.",
  timeframe: "sprint",
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
          message: "We have SIG later today! Please share with your SIG head, <@${ this.socialStructure.sigHead.slackId }>, your completed deliverables for this week (or whatever slice of them you were able to finish) along with a couple sentences about: \n(1) what risk you were trying to address this week was; \n(2) what you ended up delivering to address that risk; and \n(3) what new understanding, risks, and/or questions that deliverable has surfaced.",
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
          message: "Great work at SIG today! When you have a moment, please share your takeaways from SIG meeting in a thread reply to this message. Try to include your revised understanding of project risks and planned deliverables for the upcoming week, as you discussed with <@${ this.socialStructure.sigHead.slackId }>.",
          sigName: this.socialStructure.name,
          opportunity: (async function () {
            return await this.endOfVenue(
              await this.venues.find(this.where("kind", "SigMeeting"))
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
          message: "It's DTR day! Before DTR, check-in with <@${ this.socialStructure.sigHead.slackId }> about: \n(1) what risk and <https://docs.google.com/spreadsheets/d/1LTKNnT5WhedVxc9XJQOTHm8BaQj2wlQvPqr_Yqcuo7Q/edit#gid=27941612|LIP module> you plan to work on during Mysore; and \n(2) what risk you plan to get help on during Pair Research.",
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