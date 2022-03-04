// application imports
import express from 'express';
import mongoose from 'mongoose';

// controllers

// routes
import { scriptRouter } from "./routes/script.routes.js";

// fixtures for development
import {
  createScriptLibraryFixtures,
  isScriptLibraryEmpty
} from "./models/fixtures/scriptLibraryFixtures.js";
import {
  createActiveScriptFixtures,
  isMonitoredScriptsEmpty
} from "./models/fixtures/activeScriptFixtures.js";

// setup application
const app = express();
const router = express.Router();

// fetch env variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/studio-api";
const NODE_ENV = process.env.NODE_ENV || "development";

// setup options for mongodb connection
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

// attempt to connect to mongodb, and detect any connection errors
try {
  await mongoose.connect(MONGODB_URI, mongooseOptions);
} catch (error) {
  console.error(`Error with connecting to MongoDB: ${ error }`);
} finally {
  if (NODE_ENV === "development") {
    // TODO: populate DB with fixtures here
    console.log("Development -- Populating databases for development.");
    await createScriptLibraryFixtures();
    await createActiveScriptFixtures();
  }

  if (NODE_ENV === "production") {
    // check if collections are empty first so that data isn't overwritten
    if (await isScriptLibraryEmpty() && await isMonitoredScriptsEmpty()) {
      console.log("Production -- Databases are empty. Populating.");
      // populate them if they are
      await createScriptLibraryFixtures();
      await createActiveScriptFixtures();
    }
  }
}

// get studio api url
export const studioAPIUrl = process.env.API_URL;

// listen for any errors after initial connection
mongoose.connection.on('error', err => {
  console.error(`MongoDB connection error: ${ err }`);
});

// setup routes
app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads
app.use("/scripts", scriptRouter);

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
