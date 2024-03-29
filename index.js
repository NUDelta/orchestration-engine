// application imports
import express from 'express';
import mongoose from 'mongoose';
import schedule from 'node-schedule';

// controllers

// routes
import { scriptRouter } from './routes/script.routes.js';
import { activeIssuesRouter } from './routes/activeIssues.routes.js';
import { dataRouter } from './routes/data.routes.js';
import { testerRouter } from './routes/tester.routes.js';
import { simulatorRouter } from './routes/simulator.routes.js';
import { organizationalObjectRouter } from './routes/organizationalObjects.routes.js';

// fixtures for development
import {
  createScriptLibraryFixtures,
  isScriptLibraryEmpty,
} from './models/fixtures/scriptLibraryFixtures.js';
import {
  createActiveScriptFixtures,
  isMonitoredScriptsEmpty,
} from './models/fixtures/activeScriptFixtures.js';
import {
  checkActiveIssues,
  checkMonitoredScripts,
  archiveStaleIssues,
} from './controllers/execution/executionFlow.js';

// setup application
const app = express();
const router = express.Router();

// fetch env variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/studio-api';
const NODE_ENV = process.env.NODE_ENV || 'development';

// setup options for mongodb connection
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// attempt to connect to mongodb, and detect any connection errors
try {
  await mongoose.connect(MONGODB_URI, mongooseOptions);
} catch (error) {
  console.error(`Error with connecting to MongoDB: ${error}`);
} finally {
  if (NODE_ENV === 'development') {
    // TODO: populate DB with fixtures here
    console.log('Development -- Populating databases for development.');
    await createScriptLibraryFixtures(true);
    await createActiveScriptFixtures(true);
  }

  if (NODE_ENV === 'production') {
    // check if collections are empty first so that data isn't overwritten
    if ((await isScriptLibraryEmpty()) && (await isMonitoredScriptsEmpty())) {
      console.log('Production -- Databases are empty. Populating.');
      // populate them if they are
      await createScriptLibraryFixtures(true);
      await createActiveScriptFixtures(true);
    }
    // populate any new scripts not already in the collection
    else {
      console.log(
        'Production -- Databases are NOT empty. Only adding new scripts'
      );
      await createScriptLibraryFixtures(false);
      await createActiveScriptFixtures(false);
    }
  }
}

// get studio api url
export const studioAPIUrl = process.env.STUDIO_API_URL;

// listen for any errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

// setup routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads
app.use('/scripts', scriptRouter);
app.use('/activeIssues', activeIssuesRouter);
app.use('/data', dataRouter);
app.use('/tester', testerRouter);
app.use('/simulator', simulatorRouter);
app.use('/organizationalObjects', organizationalObjectRouter);

// catch any undefined routes
app.all('*', (request, response) => {
  console.error(
    `External request: ${request.url} does not exist. Returning 404 error.`
  );
  return response.status(404).json({ error: `${request.url} not found` });
});

// start application
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use((req, res) => {
  res.send('Welcome to Express');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// start cron job in production
if (NODE_ENV === 'production') {
  let MINUTE = process.env.MINUTE || 30;
  console.log(
    `Starting cron job to monitor for scripts every ${MINUTE} minutes.`
  );
  schedule.scheduleJob(`*/${MINUTE} * * * *`, async () => {
    console.log(`Beginning Monitoring Loop at ${new Date()}`);

    // step (1): check all monitored scripts, and create issues for triggered scripts
    try {
      let createdIssues = await checkMonitoredScripts();
      console.log('Created Issues: ', createdIssues);
    } catch (error) {
      console.error(
        `Error in cron job loop for checkMonitoredScripts: ${error.stack}`
      );
    }

    // step (2): check active issues to see if any feedback was triggered
    try {
      let triggeredFeedbackOpps = await checkActiveIssues();
      console.log('Triggered Feedback Opportunities: ', triggeredFeedbackOpps);
    } catch (error) {
      console.error(
        `Error in cron job loop for checkActiveIssues: ${error.stack}`
      );
    }

    // step (3): clean-up issues based on expiry time
    try {
      let [archivedIssues, activeIssues] = await archiveStaleIssues();
      console.log('Archived Issues: ', archivedIssues);
      console.log('New Active Issues from Reset Issues: ', activeIssues);
    } catch (error) {
      console.error(
        `Error in cron job loop for cleanUpActiveIssues: ${error.stack}`
      );
    }
  });
}
