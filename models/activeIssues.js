/**
 * This model is the activated issues caused by detectors returning true for a student or project.
 */

import mongoose from "mongoose";

// TODO: add resources to actionable feedback
export const ActiveIssues = mongoose.model("ActiveIssues",
  new mongoose.Schema({
    script_id: { type: mongoose.Schema.Types.ObjectId, ref: "MonitoredScripts"},
    name: { type: String, required: true },
    date_triggered: { type: Date, default: Date.now() },
    expiry_time: { type: Date, required: true },
    repeat: { type: Boolean, required: true },
    students: [ { type: String, required: true } ],
    project: { type: String, required: true },
    detector: { type: String, required: true }, // TODO: is this needed for the active issue?
    computed_actionable_feedback: [
      {
        opportunity: { type: Date, required: true },
        target: {
          message: { type: String, required: true },
          students: [ { type: String, required: true } ],
          project: { type: String, required: true },
        },
        outlet_fn: { type: String, required: true } // function that returns where the feedback should go
      }
    ]
  })
);