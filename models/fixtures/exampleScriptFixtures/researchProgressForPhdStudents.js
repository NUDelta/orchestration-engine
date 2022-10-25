/**
 * Helping Ph.D. students stay on track throughout the week on their research work.
 */
export default {
  name: "Research progress for Ph.D. students",
  description: "Students have multiple opportunities to get support from their mentors and their peers for their work.",
  timeframe: "sprint",
  repeat: false,
  applicable_set: (async function() {
    return this.socialStructures.filter(this.where("name", "Summer BBQ"));
  }).toString(),
  situation_detector: (async function() {
    return true;
  }).toString(),
  strategies: [
    {
      name: "Clear deliverable for the week",
      description: "Help students articulate what their planned deliverable is this week, and any risks or blockers in achieving it.",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "Here's a mid-week check-in on how you're doing. In a couple sentences, please share: \n(1) What are your planned deliverable for this week? How will they advance your research understanding?; and \n(2) Are you on track for reaching your deliverables? If not, what are some risks and blockers that your peers and <@${ this.socialStructure.sigHead.slackId }> can help with?",
          sigName: this.socialStructure.name,
          opportunity: (async function () {
            // TODO: this is a bit unnatural rn
            return await this.daysBefore(
              await this.morningOfVenue(
                await this.venues.find(this.where("kind", "SigMeeting"))),
              2
            );
          }).toString()
        })
      }).toString()
    },
    {
      name: "Share deliverables for SIG",
      description: "Help students articulate their updated understanding of the research work, and give mentors the opportunity to review deliverables before the SIG meeting later that day.",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "Share your deliverables (or whatever slice of them you were able to finish) in a thread before tomorrow's SIG. Please include a couple sentences about: \n(1) what risk you were trying to address this week was; \n(2) what you ended up delivering to address that risk; \n(3) what new understanding, risks, and/or questions that deliverable has surfaced; and \n(4) what (if any) feedback you'd like from <@${ this.socialStructure.sigHead.slackId }>.",
          sigName: this.socialStructure.name,
          opportunity: (async function () {
            // TODO: this is a bit unnatural rn
            return await this.daysBefore(
              await this.afternoonOfVenue(
                await this.venues.find(this.where("kind", "SigMeeting"))),
              1
            );
          }).toString()
        })
      }).toString()
    },
    {
      name: "Reflect on previous week and plan next week",
      description: "Help students reflect on how the last week went, and plan their research sprint for the next week.",
      strategy_function: (async function () {
        return await this.messageChannel({
          message: "We have SIG later today! Please fill out the <https://docs.google.com/spreadsheets/d/1AmVEs2zOF-ffg7qNCpLyxqCjz8qgSrVohU4WUQSX4-Q/edit#gid=0|MicroBoard> before the meeting, including: \n(1) a reflection on how things went this week; \n(2) plans for the next week; and \n(3) any agenda items that you'd like to discuss with the group.",
          sigName: this.socialStructure.name,
          opportunity: (async function () {
            return await this.morningOfVenue(
              await this.venues.find(this.where("kind", "SigMeeting"))
            );
          }).toString()
        })
      }).toString()
    },
  ]
};