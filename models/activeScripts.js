import mongoose from "mongoose";

// TODO: I don't like that this is duplicating the script rn...
export const ActiveScripts = mongoose.model("ActiveScripts",
  new mongoose.Schema({
    script_id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    description: { type: String, required: true },
    target: { type: Object, required: true }, // TODO: change to a function after targets are functional
    detector: { type: String, required: true },
    actionable_feedback: { type: Array, required: true },
    date_added: { type: Date, default: Date.now() }
  })
);