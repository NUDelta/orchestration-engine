# Orchestration Engine
A system for authoring and executing Orchestration Scripts that support member of an [Agile Research Studios (ARS)](http://agileresearch.io/) community learn the skills to access a community of support for their research work.

## Setup
1. Create a `.env` file as follows:
    ```
    NODE_ENV=development
   PORT=3000
   DEBUG=true
   API_URL=http://localhost:3000
   CORS_ORIGINS=http://localhost:8080
   MONGODB_URI=mongodb://localhost/studio-api
   POOL_SIZE=25
    ```

## Development
1. Run `npm install` to download the necessary packages.
2. Run `npm run dev` to start the local Node.js application.