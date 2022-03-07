/**
 * Have students send updated sprint logs the day after SIG
 * @type {EnforceDocument<T & Document<any, any, any>, {}, {}>}
 */
export default {
  name: "Discuss EOQ deliverables during SIG",
  description: "At the last SIG meeting for the quarter, make sure we discuss what each student's EOQ deliverables will be.",
  timeframe: "week",
  repeat: false,
  target: (async function() {
    return await this.getAllProjects();
  }).toString(),
  detector: (async function() {
    return true; // trigger immediately
  }).toString(),
  actionable_feedback: [
    {
      feedback_message: "Let's make sure we discuss your plans for EOQ deliverables during SIG today.",
      feedback_opportunity: (async function () {
        let lastSigMeetingTime = await this.lastSigMeeting();
        return new Date(lastSigMeetingTime.start_time);
      }).toString(),
      feedback_outlet: (async function () {
        return await this.sendSlackMessageToSig("Let's make sure we discuss your plans for EOQ deliverables during SIG today.");
      }).toString()
    }
  ]
};