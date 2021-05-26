// application imports
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from "body-parser";
import { DateTime } from "luxon";

// controllers
import { compileScriptFromJson } from "./controllers/compiler.js";
import { simulateScripts } from "./controllers/simulator.js";

// routes

// fixtures for development

// setup application
const app = express();
const router = express.Router();

// fetch env variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/studio-api";
const POOL_SIZE = process.env.POOL_SIZE || 25;
const NODE_ENV = process.env.NODE_ENV || "development";

// setup options for mongodb connection
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: POOL_SIZE
}

// attempt to connect to mongodb, and detect any connection errors
try {
  await mongoose.connect(MONGODB_URI, mongooseOptions);
} catch (error) {
  console.error(`Error with connecting to MongoDB: ${ error }`);
} finally {
  if (NODE_ENV === "development") {
    // TODO: populate DB with fixtures here
  }
}

// listen for any errors after initial connection
mongoose.connection.on('error', err => {
  console.error(`MongoDB connection error: ${ err }`);
});

// setup routes
app.use(bodyParser.json(), cors());

// catch any undefined routes
app.all('*', (request, response) => {
  console.log('Returning a 404 from the catch-all route');
  return response.sendStatus(404);
});

// start application
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use((req, res) => {
  res.send('Welcome to Express');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${ PORT }`)
});

// TODO: FOR TESTING ONLY
// these are fancy slack reminders (the sprint log ones will have more of a condition)
// hmm, so right now, these dont really need the targets since the conditions are really just triggers on the venue
console.log("Ping students to send a revised sprint log the day after SIG\n",
  await compileScriptFromJson({
    script_target: "sig: Agile Research Studios SIG",
    detection_condition: "after(Agile Research Studios SIG, 1 days)", // this is really more a trigger for when to deliver the actionable feedback (not the detection)
    actionable_feedback: {
      feedback_trigger: "immediate",
      feedback_message: "Send your revised sprint log to your mentor to get feedback." // feedback should also tie into what slack channel it is being sent.
    }
  }),
  "\n--------------------------\n\n"
);

console.log("Ping students to check in on what LIP they will do during Studio\n",
  await compileScriptFromJson({
    script_target: "project: Orchestration Scripting Environments",
    detection_condition: "before(Studio meeting, 3 hours)",
    actionable_feedback: {
      feedback_trigger: "immediate",
      feedback_message: "Do you know what LIP you're working on during Studio? Reply with: (1) what risk you plan to work on during Mysore; (2) what part of the canvas that related to; and (3) what learning module or template you’ll use during the Mysore session."
    }
  }),
  "\n--------------------------\n\n"
);

console.log("Make sure we talk about deliverables for next week during SIG\n",
  await compileScriptFromJson({
    script_target: "sig: Networked Orchestration Technologies SIG",
    detection_condition: "during(Networked Orchestration Technologies SIG)",
    actionable_feedback: {
      feedback_trigger: "immediate",
      feedback_message: "Make sure to talk about deliverables for next week."
    }
  }),
  "\n--------------------------\n\n"
);

console.log("Check in on how students' deliverables are going a couple days before SIG\n",
  await compileScriptFromJson({
    script_target: "sig: Agile Research Studios SIG",
    detection_condition: "before(Agile Research Studios SIG, 2 days)",
    actionable_feedback: {
      feedback_trigger: "immediate",
      feedback_message: "How are your deliverables going? Do you need any feedback or help?"
    }
  }),
  "\n--------------------------\n\n"
);



// simulate from start to end of Spring Quarter 2021
let startTime = DateTime.fromISO("2021-03-29T00:00:00", { zone: "America/Chicago" });
let endTime = DateTime.fromISO("2021-06-06T00:00:00", { zone: "America/Chicago" });

await simulateScripts([
    {
      script_target: "sig: Agile Research Studios SIG",
      detection_condition: "after(Agile Research Studios SIG, 1 days)",
      actionable_feedback: {
        feedback_trigger: "immediate",
        feedback_message: "Send your revised sprint log to your mentor to get feedback."
      }
    },
    {
      script_target: "project: Orchestration Scripting Environments",
      detection_condition: "before(Studio meeting, 3 hours)",
      actionable_feedback: {
        feedback_trigger: "immediate",
        feedback_message: "Do you know what LIP you're working on during Studio? Reply with: (1) what risk you plan to work on during Mysore; (2) what part of the canvas that related to; and (3) what learning module or template you’ll use during the Mysore session."
      }
    },
    {
      script_target: "sig: Networked Orchestration Technologies SIG",
      detection_condition: "during(Networked Orchestration Technologies SIG)",
      actionable_feedback: {
        feedback_trigger: "immediate",
        feedback_message: "Make sure to talk about deliverables for next week."
      }
    },
    {
      script_target: "sig: Agile Research Studios SIG",
      detection_condition: "before(Agile Research Studios SIG, 2 days)",
      actionable_feedback: {
        feedback_trigger: "immediate",
        feedback_message: "How are your deliverables going? Do you need any feedback or help?"
      }
    }
  ],
  startTime,
  endTime
);