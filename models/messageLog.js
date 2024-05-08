/**
 * This module provides a schema for the message log. Message logs are saved anytime a message is sent to a user by Slack. This is useful for tracking messages sent to users.
 */

import mongoose from 'mongoose';

/**
 * Model for the message log.
 * @type {Model<any>}
 */
export const MessageLog = mongoose.model(
  'MessageLog',
  new mongoose.Schema({
    timestamp: {
      type: Date,
      default: Date.now,
    },
    target: {
      type: {
        type: String,
        enum: ['project', 'sig', 'people'],
        required: true,
      },
      projectName: { type: String, required: false, default: '' },
      sigName: { type: String, required: false, default: '' },
      people: [{ type: String, required: false, default: '' }],
    },
    message: {
      type: String,
      required: true,
    },
    error: {
      type: String,
      required: false,
      default: '',
    },
  })
);
