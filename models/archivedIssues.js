/**
 * This model is the archived issues that have been fulfilled and expired.
 */

import mongoose from "mongoose";

// TODO: add resources to actionable feedback

/**
 * Issues that have become stale and are no longer monitored for.
 * @type {Model<T & Document<any, any, any>>}
 */
export const ArchivedIssues = mongoose.model("ArchivedIssues",
  new mongoose.Schema({
    script_id: { type: mongoose.Schema.Types.ObjectId, ref: "MonitoredScripts"},
    name: { type: String, required: true },
    date_triggered: { type: Date, required: true },
    date_expired: { type: Date, required: true, default: Date.now() },
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