// application imports
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from "body-parser";

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