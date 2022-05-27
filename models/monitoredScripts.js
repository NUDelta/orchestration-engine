/**
 * This model is for orchestration scripts that have been activated from the ScriptLibrary.
 */

import mongoose from "mongoose";
import { scriptSchema } from "./scriptLibrary.js";

// TODO: add resources to actionable feedback

/**
 * Model for scripts that are actively being monitored.
 * Inherits the scriptSchema.
 * @type {Model<any>}
 */
export const MonitoredScripts = mongoose.model("MonitoredScripts", scriptSchema);