import { Router } from 'express';
import {
  transformOSCode,
  asyncThisConfig,
} from '../controllers/codeTransformer/babelConfiguration.js';
import { createMonitoredScript } from '../controllers/modelControllers/monitoredScriptsController.js';

export const scriptRouter = new Router();

/**
 * Route to create a new MonitoredScript.
 * request body: {
 *  scriptName: string,
 *  scriptDescription: string,
 *  scriptTimeframe: string,
 *  shouldScriptRepeat: boolean,
 *  applicableSet: string,
 *  situationDetector: string,
 *  strategies: [
 *    {
 *      name: string,
 *      description: string,
 *      strategyFunction: string,
 *    }
 *  ]
 * }
 */
scriptRouter.post('/createScript', async (req, res) => {
  try {
    // parse out input from request body
    const {
      scriptName,
      scriptDescription,
      scriptTimeframe,
      shouldScriptRepeat,
      applicableSet,
      situationDetector,
      strategies,
    } = req.body;

    // transform code into OS-compatible code
    let transformedApplicableSet = transformOSCode(
      applicableSet,
      asyncThisConfig
    );

    let transformedSituationDetector = transformOSCode(
      situationDetector,
      asyncThisConfig
    );

    let transformedStrategies = strategies.map((strategy) => {
      return {
        name: strategy.name,
        description: strategy.description,
        strategy_function: transformOSCode(
          strategy.strategyFunction,
          asyncThisConfig
        ),
      };
    });

    // TODO: prior to creating, check if a script for the same goal / target already exists
    // ^ this might be a bit tricky to compute, but it's important to prevent duplicate scripts
    // create a new MonitoredScript and save it to the database
    const newScript = createMonitoredScript(
      scriptName,
      scriptDescription,
      scriptTimeframe,
      shouldScriptRepeat,
      transformedApplicableSet,
      transformedSituationDetector,
      transformedStrategies
    );
    const createdScript = await newScript.save();

    // return a successful response with the created script
    res.status(200).json(createdScript);
  } catch (error) {
    let errorMessage = `Error when creating MonitoredScript via API route: ${error.stack}`;
    console.error(errorMessage);
    res.status(500).send(errorMessage);
  }
});

// TODO: implement
scriptRouter.get('/getScripts', async (req, res) => {});

// TODO: implement
scriptRouter.get('/getScript', async (req, res) => {});

// TODO: implement
scriptRouter.post('/updateScript', async (req, res) => {});

// TODO: implement
scriptRouter.post('/deleteScript', async (req, res) => {});
