# Orchestration Engine
A system for authoring and executing Orchestration Scripts that support member of an [Agile Research Studios (ARS)](http://agileresearch.io/) community learn the skills to access a community of support for their research work.

## Prerequisites
1. Make sure you have [Node.js](https://nodejs.org/en/) and [yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable) installed.

## Setup for local development
1. Create a `.env` file as follows:
    ```
   NODE_ENV=development
   PORT=5001
   DEBUG=true
   STUDIO_API_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost/orchestration-engine
    ```

## Development
1. Run `yarn` to download the necessary packages.
2. Run `yarn run dev` to start the local Node.js application.

## Deployment
For production, use the following environment variables:
```
NODE_ENV=production
PORT=8080
STUDIO_API_URL=<url of deployed studio api>
MONGODB_URI=<url of mongodb>
MINUTE=30
```