import { Router } from "express";

import { OrchestrationScript } from "../models/scriptLibrary.js";
import { ActiveScripts } from "../models/activeScripts.js";
import mongoose from "mongoose";
import { runTests } from "../imports/tester.js";

export const scriptRouter = new Router();

// manually trigger an existing script
scriptRouter.post("/triggerScript", async (req, res) => {
  try {
    // get parameters from request
    let scriptId = req.body.scriptId;
    let studentList = req.body.students === undefined ? [] : JSON.parse(req.body.students);
    let projList = req.body.projects === undefined ? [] : JSON.parse(req.body.projects);
    let feedbackMessage = req.body.feedbackMessage;

    // get the template script for the passed in script ID
    let templateScript = await OrchestrationScript.findOne({ _id: scriptId });
    let newActiveScript = new ActiveScripts({
      script_id: templateScript._id,
      name: templateScript.name,
      description: templateScript.description,
      target: {
        students: studentList,
        projects: projList
      },
      detector: templateScript.detector,
      actionable_feedback: [{
        feedback_message: feedbackMessage,
        feedback_opportunity: (async function () { return new Date(); }).toString()
      }]
    });
    await newActiveScript.save();

    // run tester with the new script
    await runTests(templateScript._id, new Date(2021, 4, 31), new Date(2021, 5, 7))
  } catch (error) {
    console.error(`Error in /triggerScript route: ${ error }`);
  }

  res.json(req.query);
});