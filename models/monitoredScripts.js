/**
 * This model is for orchestration scripts that have been activated from the ScriptLibrary. Their
 * detector conditions are monitored for 5 minutes.
 */

import mongoose from "mongoose";

// TODO: add resources to actionable feedback
// TODO: I don't like that this is duplicating the the ScriptLibrary model rn...
// Is there a reason they might be different? If not, export it from scriptLibrary.js and reuse
export const MonitoredScripts = mongoose.model("MonitoredScripts",
  new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    timeframe: { type: String, enum: ["day", "week", "month", "sprint", "quarter"] },
    repeat: { type: Boolean },
    target: { type: String, required: true },                     // actually a function
    detector: { type: String, required: true },                   // actually a function
    actionable_feedback: [
      {
        feedback_message: { type: String, required: true },
        feedback_opportunity: { type: String, required: true },   // actually a function
        feedback_outlet: { type: String, required: true }         // actually a function
      }
    ]
  })
);