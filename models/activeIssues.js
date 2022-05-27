/**
 * This model is the activated issues caused by detectors returning true for a student or project.
 */

import mongoose from "mongoose";

// TODO: add resources to actionable feedback

/**
 * Issues that have been created from triggered Monitored Scripts.
 * These are monitored for to see if a strategy should be delivered.
 * @type {Model<T & Document<any, any, any>>}
 */
export const ActiveIssues = mongoose.model("ActiveIssues",
  new mongoose.Schema({
    script_id: { type: mongoose.Schema.Types.ObjectId, ref: "MonitoredScripts"},
    name: { type: String, required: true },
    date_triggered: { type: Date, default: Date.now() },
    expiry_time: { type: Date, required: true },
    repeat: { type: Boolean, required: true },
    issue_target: { type: Object, required: true },
    target_hash: { type: String, required: true }, // used to check if an existing issue is present
    computed_strategies: [
      {
        opportunity: { type: Date, required: true },
        outlet_fn: { type: String, required: true }, // function that returns where the feedback should go
        outlet_args: { type: Object, required: true }
      }
    ]
  })
);