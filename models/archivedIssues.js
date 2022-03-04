/**
 * This model is the archived issues that have been fulfilled and expired.
 */

import mongoose from "mongoose";

export const ArchivedIssues = mongoose.model("ArchivedIssues",
  new mongoose.Schema({
    script_id: { type: mongoose.Schema.Types.ObjectId, ref: "MonitoredScripts"},
    name: { type: String, required: true },
    date_triggered: { type: Date, required: true },
    date_expired: { type: Date, required: true, default: Date.now() },
    repeat: { type: Boolean, required: true },
    target: {
      students: [ { type: String, required: true } ],
      project: { type: String, required: true }
    },
    detector: { type: String, required: true }, // TODO: is this needed for a archived issue?
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