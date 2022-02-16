import mongoose from "mongoose";
import mongooseFunction from "mongoose-function"
mongooseFunction(mongoose)

// TODO: figure out how to actually store functions without needing the parse a string
// TODO: change targets to a function that gets students/projects at run-time
export const OrchestrationScript = mongoose.model("ScriptLibrary",
  new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    target: { type: String, required: true },
    detector: { type: String, required: true },
    actionable_feedback: [
      {
          feedback_message: { type: String, required: true },
          feedback_opportunity: { type: String, required: true },
          feedback_outlet: { type: String, required: true } // function that returns where the feedback should go
      }
    ]
  })
);