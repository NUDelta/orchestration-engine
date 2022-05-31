/**
 * Helping students use venues throughout the week to progress their research work.
 */
export default {
  name: "Using venues throughout the week for progressing research work",
  description: "Students have multiple opportunities to get support from their mentors and their peers for their work.",
  timeframe: "sprint",
  repeat: false,
  applicable_set: (async function() {
    return this.projects.filter(
      this.whereSome(
        "students",
        "name",
        ["Molly Pribble"]
      )
    );
  }).toString(),
  situation_detector: (async function() {
    return await this.isDayOfVenue(
      await this.venues.find(this.where("kind", "SigMeeting"))
    );
  }).toString(),
  strategies: [
    {
      name: "Have students send deliverables before SIG meeting",
      description: "Help students articulate their updated understanding of the research work, and give mentors the opportunity to review deliverables before the SIG meeting later that day.",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "We have SIG later today! Please share with your SIG head, <@${ this.project.sigHead.slackId }>, your completed deliverables for this week (or whatever slice of them you were able to finish) along with a couple sentences about: \n(1) what risk you were trying to address this week was; \n(2) what you ended up delivering to address that risk; and \n(3) what new understanding, risks, and/or questions that deliverable has surfaced.",
          projectName: this.project.name,
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
          message: "Great work at SIG today! When you have a moment, please share your takeaways from SIG meeting below. Try to include your revised understanding of your project risks and planned deliverables for the upcoming week, as you discussed with <@${ this.project.sigHead.slackId }>.",
          projectName: this.project.name,
          opportunity: (async function () {
            return await this.endOfVenue(
              await this.venues.find(this.where("kind", "SigMeeting"))
            );
          }).toString()
        })
      }).toString()
    },
    {
      name: "Planning to attend office hours",
      description: "If students plan to attend office hours, have them send any artifacts that they would like their mentor to look at beforehand.",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "We have office hours later today! Are you planning to attend? If so, let <@${ this.project.sigHead.slackId }> know and send them any artifacts and/or a summary of the risk that you want to get feedback on or address during the session.",
          projectName: this.project.name,
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
          message: "It's DTR day! Before DTR, check-in with <@${ this.project.sigHead.slackId }> about: \n(1) what risk and <https://docs.google.com/spreadsheets/d/1_uUmGnkkKACsgyOLQJRB8Uhi4NGKQTOwyxEJZOcStSc/edit#gid=2093087339|LIP module> you plan to work on during Mysore; and \n(2) what risk you plan to get help on during Pair Research.",
          projectName: this.project.name,
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