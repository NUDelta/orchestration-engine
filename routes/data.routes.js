import { Router } from 'express';
import { createScriptLibraryFixtures } from '../models/fixtures/scriptLibraryFixtures.js';
import { createActiveScriptFixtures } from '../models/fixtures/activeScriptFixtures.js';

export const dataRouter = new Router();

// TODO: have routes to refresh data for each controller separately

/**
 * Refreshes all data in MongoDB when called.
 */
dataRouter.post('/refreshData', async (req, res) => {
  let shouldClear;

  try {
    // get parameters
    shouldClear = req.body.shouldClear ?? false;

    // clear existing data and refresh with fixtures
    await createScriptLibraryFixtures(shouldClear);
    await createActiveScriptFixtures(shouldClear);

    let msg = `Orchestration Script data refreshed. Existing data was cleared? ${shouldClear}`;
    console.log(msg);
    res.send(msg);
  } catch (error) {
    let errorMessage = `Error when refreshing data via API route: ${error.stack}`;
    console.error(errorMessage);
    res.send(errorMessage);
  }
});
