# Orchestration Engine
A system for authoring and executing Orchestration Scripts that support member of an [Agile Research Studios (ARS)](http://agileresearch.io/) community learn the skills to access a community of support for their research work.

## Prerequisites
1. Make sure you have [Node.js](https://nodejs.org/en/), [yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable), and [MongoDB](https://www.mongodb.com/docs/guides/server/install/) installed.
2. Clone the [Studio API](https://github.com/NUDelta/studio-api) if you plan to do local development.

## Setup for local development
1. Create a `.env` file as follows:
    ```
   NODE_ENV=development
   PORT=5001
   DEBUG=true
   STUDIO_API_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost/orchestration-engine
   TZ=UTC
   ```

## Development
1. Start the Studio API per instructions in the [README](https://github.com/NUDelta/studio-api#prerequisites) of it's repo.
2. Run `yarn` to download the necessary packages.
3. Run `yarn run dev` to start the local Node.js application. 
4. In a separate tab, start the MongoDB daemon using `mongod --dbpath=<PATH_TO_DB>`.
   1. Note: if you have cloned and started the Studio API before this step, you will not need to do it again since the daemon will be running.

## Deployment
For production, use the following environment variables:
```
NODE_ENV=production
PORT=8080
STUDIO_API_URL=<url of deployed studio api>
MONGODB_URI=<url of mongodb>
MINUTE=30
TZ=UTC
```