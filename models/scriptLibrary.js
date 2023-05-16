/**
 * This model is the orchestration script structured that is used to store a library of scripts
 * that can be activated as desired. These scripts are not monitored for by default.
 */

import mongoose from 'mongoose';
import mongooseFunction from 'mongoose-function';
mongooseFunction(mongoose);

// TODO: add resources to actionable feedback
// TODO: figure out how to actually store functions without needing the parse a string

/**
 * Declare a script schema that's used by other mongoose models
 * @type {module:mongoose.Schema<any, Model<any, any, any, any>, any, any>}
 */
export const scriptSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  timeframe: {
    type: String,
    enum: ['day', 'week', 'month', 'sprint', 'quarter'],
  },
  repeat: { type: Boolean },
  applicable_set: { type: String, required: true }, // actually a function
  situation_detector: { type: String, required: true }, // actually a function
  strategies: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      strategy_function: { type: String, required: true }, // actually a function
    },
  ],
});

/**
 * Model for Orchestration Scripts stored in a library.
 * @type {Model<any>}
 */
export const OrchestrationScript = mongoose.model(
  'ScriptLibrary',
  scriptSchema
);
