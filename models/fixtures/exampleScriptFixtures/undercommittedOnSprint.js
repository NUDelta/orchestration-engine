import { OrchestrationScript } from "../../scriptLibrary.js";
import mongoose from "mongoose";

/**
 * Students not planning all of their points.
 * @type {EnforceDocument<T & Document<any, any, any>, {}, {}>}
 */
export default new OrchestrationScript({
  _id: mongoose.Types.ObjectId("61af17044cfa9c626adcb2aa"),
  name: "Fully planning sprints",
  description: "Students should aim to plan most of their sprints so that we can discuss plans during SIG meetings.",
  timeframe: "sprint",
  repeat: false,
  target: (async function() {
    return await this.getProjectsInSig("Collective Experiences");
  }).toString(),
  detector: (async function() {
    let currentSprint = await this.getCurrentSprintLog();
    let currPointsCommitted = currentSprint.totalPoints.points_committed.total;
    let currPointsAvailable = currentSprint.totalPoints.point_available;
    return currPointsCommitted < 0.75 * currPointsAvailable;
  }).toString(),
  actionable_feedback: [
    {
      feedback_message: "Looks like you still have points to plan for your sprint. Let's discuss how you may use these points during SIG.",
      feedback_opportunity: (async function () {
        return await this.during(await this.venue("SIG"));
      }).toString(),
      feedback_outlet: (async function () {
        return await this.sendSlackMessageForProject("Looks like you still have points to plan for your sprint. Let's discuss how you may use these points during SIG.");
      }).toString()
    }
  ]
});