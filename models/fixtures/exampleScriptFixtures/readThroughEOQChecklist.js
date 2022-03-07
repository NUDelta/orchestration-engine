import { OrchestrationScript } from "../../scriptLibrary.js";

/**
 * Have students send updated sprint logs the day after SIG
 * @type {EnforceDocument<T & Document<any, any, any>, {}, {}>}
 */
export default new OrchestrationScript({
  name: "Have students read EOQ checklist before last SIG",
  description: "Students should read through the EOQ checklist prior to final SIG and plan what their deliverables will be.",
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
      feedback_message: "Today is our last SIG for the quarter! Try to read through the EOQ checklist (https://docs.google.com/document/d/1GXvf4m7M9D6b_j8hacTxN9JhsDvZgdqSQmgwLiLHlRY/edit?usp=sharing) before our SIG today, and plan what your EOQ deliverables will be.",
      feedback_opportunity: (async function () {
        let lastSigMeetingTime = await this.lastSigMeeting();
        let outputTime = new Date(lastSigMeetingTime.start_time);
        outputTime.setHours(outputTime.getHours() - 3);

        return outputTime;
      }).toString(),
      feedback_outlet: (async function () {
        return await this.sendSlackMessageForProject("Today is our last SIG for the quarter! Try to read through the EOQ checklist (https://docs.google.com/document/d/1GXvf4m7M9D6b_j8hacTxN9JhsDvZgdqSQmgwLiLHlRY/edit?usp=sharing) before our SIG today, and plan what your EOQ deliverables will be.");
      }).toString()
    }
  ]
});