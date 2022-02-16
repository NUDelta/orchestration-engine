import mongoose from "mongoose";

// TODO: I don't like that this is duplicating the script rn...
export const ActiveScripts = mongoose.model("ActiveScripts",
  new mongoose.Schema({
      script_id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String, required: true },
      description: { type: String, required: true },
      target: { type: String, required: true },
      detector: { type: String, required: true },
      actionable_feedback: [
          {
              feedback_message: { type: String, required: true },
              feedback_opportunity: { type: String, required: true },
              feedback_outlet: { type: String, required: true } // function that returns where the feedback should go
          }
      ],
      date_added: { type: Date, default: Date.now() }
  })
);