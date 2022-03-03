import { OrchestrationScript } from "../../scriptLibrary.js";
import mongoose from "mongoose";

/**
 * Remind students to discuss status update with their mentor 1 week before it.
 * @type {EnforceDocument<T & Document<any, any, any>, {}, {}>}
 */
export default new OrchestrationScript({
  _id: mongoose.Types.ObjectId("22af18194cfa9c738adcb2bb"),
  name: "Reminder for Status Update",
  description: "Students should plan to discuss their status update plan with mentors.",
  timeframe: "day",
  repeat: false,
  target: (async function() {
    return await this.getNonPhdProjects();
  }).toString(),
  detector: (async function() {
    return true;
  }).toString(),
  actionable_feedback: [
    // TODO: also support notification at next office hours
    {
      feedback_message: "You have a status update in 1 week! Make sure to meeting with your mentor to discuss your plan.",
      feedback_opportunity: (async function () {
        // get date 1 week before status update date
        let statusUpdateDate = await this.getStatusUpdateDate();
        let notifDate = new Date(statusUpdateDate);
        notifDate.setDate(statusUpdateDate.getDate() - 7);
        return notifDate;
      }).toString(),
      feedback_outlet: (async function () {
        return await this.sendSlackMessageForProject("You have a status update in 1 week! Make sure to meeting with your mentor to discuss your plan.");
      }).toString()
    }
  ]
});