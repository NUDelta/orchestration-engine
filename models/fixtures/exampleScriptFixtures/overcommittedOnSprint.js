import { OrchestrationScript } from "../../scriptLibrary.js";
import mongoose from "mongoose";

/**
 * Students over-committing to a sprint.
 * @type {EnforceDocument<T & Document<any, any, any>, {}, {}>}
 */
export default new OrchestrationScript({
  _id: mongoose.Types.ObjectId("72af28054cfa9c626adcb2aa"),
  name: "Scoping Research Sprints",
  description: "Students should scope their research to the available points, and not be way over-committed.",
  timeframe: "sprint",
  repeat: false,
  target: (async function() {
    return await this.getAllProjects();
  }).toString(),
  detector: (async function() {
    let currentSprint = await this.getCurrentSprintLog();
    let currPointsCommitted = currentSprint.totalPoints.points_committed.total;
    let currPointsAvailable = currentSprint.totalPoints.point_available;

    return currPointsCommitted >= 1.25 * currPointsAvailable;
  }).toString(),
  actionable_feedback: [
    {
      feedback_message: "Looks like you have planned way more than your available points. Let's talk about slicing strategies today during SIG.",
      feedback_opportunity: (async function () {
        return await this.during(await this.venue("SIG"));
      }).toString(),
      feedback_outlet: (async function () {
        return await this.sendSlackMessageForProject("Looks like you have planned way more than your available points. Let's talk about slicing strategies today during SIG.");
      }).toString()
    }
  ]
});