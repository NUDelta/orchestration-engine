import { Router } from "express";

import { OrchestrationScript } from "../models/scriptLibrary.js";
import { MonitoredScripts } from "../models/monitoredScripts.js";
import mongoose from "mongoose";
import { runSimulationOfScript } from "../controllers/simulator/scriptSimulator.js";

export const scriptRouter = new Router();

// manually trigger an existing script
scriptRouter.post("/triggerScript", async (req, res) => {
  let activatedScript;
  try {
    // get parameters from request
    let scriptId = req.body.scriptId;
    let studentList = req.body.students === undefined ? [] : JSON.parse(req.body.students);
    let projList = req.body.projects === undefined ? [] : JSON.parse(req.body.projects);
    let feedbackMessage = req.body.feedbackMessage;

    // get the template script for the passed in script ID
    let templateScript = await OrchestrationScript.findOne({ _id: scriptId });
    let newActiveScript = new MonitoredScripts({
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
        feedback_opportunity: (async function () { return new Date(); }).toString(),
        feedback_outlet: (async function () { return await getSlackIdForPerson(await getStudentsInScript()) }).toString()
      }]
    });
    activatedScript = await newActiveScript.save();

    // // run tester with the new script
    // await runSimulationOfScript(templateScript._id, new Date(2021, 4, 31), new Date(2021, 5, 7))
  } catch (error) {
    console.error(`Error in /triggerScript route: ${ error }`);
    res.json(error);
    return;
  }

  // return activated script if successful
  res.json(activatedScript);
});

scriptRouter.post("/runTestForScript", async (req, res) => {
  let scriptId;
  let tickAmount
  let startDate;
  let endDate;

  try {
    // get parameters from request
    scriptId = req.body.scriptId;
    tickAmount = parseInt(req.body.tickAmount);
    startDate = req.body.startDate;
    endDate = req.body.endDate;

    // run tester with the new script
    await runSimulationOfScript(scriptId,
      new Date(startDate),
      new Date(endDate),
      tickAmount);
  } catch (error) {
    console.error(`Error in /runTestForScript route: ${ error }`);
    res.json(error);
    return;
  }

  // return 200 status if successful
  res.status(200).send(`Test successfully run for script: ${ scriptId }`);
});