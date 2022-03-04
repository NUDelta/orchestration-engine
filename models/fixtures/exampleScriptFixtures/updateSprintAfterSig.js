import { OrchestrationScript } from "../../scriptLibrary.js";

/**
 * Have students send updated sprint logs the day after SIG
 * @type {EnforceDocument<T & Document<any, any, any>, {}, {}>}
 */
export default new OrchestrationScript({
  name: "Sending updated sprints after SIG",
  description: "Students should send a revised SIG plan to their mentors after their SIG meetings.",
  timeframe: "week",
  repeat: true,
  target: (async function() {
    return await this.getNonPhdProjects();
  }).toString(),
  detector: (async function() {
    return true; // trigger immediately
  }).toString(),
  actionable_feedback: [
    {
      feedback_message: "Remember to send you revised sprint based on feedback from yesterday's SIG!",
      feedback_opportunity: (async function () {
        return await this.after(await this.venue("SIG"), {
          hours: 24,
          minutes: 0,
          seconds: 0
        });
      }).toString(),
      feedback_outlet: (async function () {
        return await this.sendSlackMessageForProject("Remember to send you revised sprint based on feedback from yesterday's SIG!");
      }).toString()
    }
  ]
});