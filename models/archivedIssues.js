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
    target: {
      students: [ { type: String, required: true } ],
      project: { type: String, required: true }
    },
    expiry_time: { type: Date, required: true },
    repeat: { type: Boolean, required: true },
    detector: { type: String, required: true }, // TODO: is this needed for the active issue?
    computed_actionable_feedback: [
      {
        message: { type: String, required: true },
        opportunity: { type: Date, required: true },
        outlet: { type: String, required: true } // function that returns where the feedback should go
      }
    ]
  })
);