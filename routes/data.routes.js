import { Router } from "express";
import { createScriptLibraryFixtures } from "../models/fixtures/scriptLibraryFixtures.js";
import { createActiveScriptFixtures } from "../models/fixtures/activeScriptFixtures.js";

export const dataRouter = new Router();

/**
 * Refreshes all data in MongoDB when called.
 */
dataRouter.get("/refreshData", async (req, res) => {
  try {
    // clear existing data and refresh with fixtures
    await createScriptLibraryFixtures();
    await createActiveScriptFixtures();

    res.send("Data refreshed.");
  } catch (e) {
    let errorMessage = `Error when refreshing data via API route: ${ e }`;
    console.error(errorMessage);
    res.send(errorMessage);
  }
});