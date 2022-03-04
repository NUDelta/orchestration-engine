/**
 * This model is the orchestration script structured that is used to store a library of scripts
 * that can be activated as desired. These scripts are not monitored for by default.
 */

import mongoose from "mongoose";
import mongooseFunction from "mongoose-function"
mongooseFunction(mongoose)

// TODO: figure out how to actually store functions without needing the parse a string
export const OrchestrationScript = mongoose.model("ScriptLibrary",
  new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    timeframe: { type: String, enum: ["day", "week", "sprint", "month", "term"] },
    repeat: { type: Boolean },
    target: { type: String, required: true },                        // actually a function
    detector: { type: String, required: true },                      // actually a function
    actionable_feedback: [
      {
          feedback_message: { type: String, required: true },
          feedback_opportunity: { type: String, required: true },   // actually a function
          feedback_outlet: { type: String, required: true }         // actually a function
      }
    ]
  })
);