import { Router } from 'express';
import { runSimulationOfScript } from '../controllers/simulator/scriptSimulator';

export const simulatorRouter = new Router();

/**
 * Run a simulation of a script for a given time period.
 * request body: {
 *  tickAmount: number,
 *  startDate: Date as string,
 *  endDate: Date as string
 * }
 */
simulatorRouter.post('/runSimulationForAllScripts', async (req, res) => {
  let tickAmount;
  let startDate;
  let endDate;

  try {
    // get parameters from request
    tickAmount = parseInt(req.body.tickAmount);
    startDate = req.body.startDate;
    endDate = req.body.endDate;

    // run tester with the new script
    let output = await runSimulationOfScript(
      new Date(startDate),
      new Date(endDate),
      tickAmount
    );

    if (output) {
      // return 200 status if successful
      res.status(200).send(`Script simulation completed.`);
    }
  } catch (error) {
    console.error(`Error in /runSimulationForAllScripts route: ${error.stack}`);
    res.json(error);
  }
});
