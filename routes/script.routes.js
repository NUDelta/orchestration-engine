import { Router } from 'express';

export const scriptRouter = new Router();

// TODO: test
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

    // TODO: run code transformer to add this and async/await before saving script
    // save script to database
    const newScript = createScript(
      scriptName,
      scriptDescription,
      scriptTimeframe,
      shouldScriptRepeat,
      applicableSet,
      situationDetector,
      strategies
    );
    const createdScript = await newScript.save();

    // return a successful response with the created script
    res.status(200).json(createdScript);
  } catch (error) {
    let errorMessage = `Error when creating MonitoredScript via API route: ${error.stack}`;
    console.error(errorMessage);
    res.send(errorMessage);
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
