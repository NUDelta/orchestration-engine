import mongoose from "mongoose";

export const ActiveScripts = mongoose.model("ActiveScripts",
  new mongoose.Schema({
    orchestration_script: { type: mongoose.Schema.Types.ObjectId, ref: "ScriptLibrary", required: true},
    date_added: { type: Date, default: Date.now() }
  })
);