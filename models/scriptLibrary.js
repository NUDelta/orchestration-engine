import mongoose from "mongoose";
import mongooseFunction from "mongoose-function"
mongooseFunction(mongoose)

// TODO: figure out how to actually store functions without needing the parse a string
export const OrchestrationScript = mongoose.model("ScriptLibrary",
  new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    target: { type: Object, required: true }, // TODO: change to a function after targets are functional
    detector: { type: String, required: true },
    actionable_feedback: { type: Array, required: true }
  })
);