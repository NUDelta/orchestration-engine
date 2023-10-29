/**
 * Provides routes for interacting with Organizational Objects, such as getting all objects and computing the current values for the targets.
 */

import { Router } from 'express';
import { getAllProjects } from '../controllers/dataFetchers/fetchProjects.js';
import { getRefreshedObjsForTarget } from '../controllers/execution/executionFns.js';

export const organizationalObjectRouter = new Router();

/**
 * Get all Organizational Objects.
 * TODO: implement
 */
organizationalObjectRouter.get(
  '/fetchOrganizationalObjects',
  async (req, res) => {}
);

/**
 * Get computed organizational objects for a target object.
 * request body: {
 *  projectName: string
 * }
 */
organizationalObjectRouter.post(
  '/getComputedOrganizationalObjectsForProject',
  async (req, res) => {
    try {
      // parse input from request body
      const { projectName } = req.body;

      // get all projects
      let allProjects = await getAllProjects();

      // find project that matches by name
      let relevantProjTarget = allProjects.find(
        (currProject) => currProject.name === projectName
      );
      if (relevantProjTarget === undefined)
        throw new Error(`${projectName} not found in Studio Database`);

      // get org objects for the current project target and return
      let relevantOrgObjs = await getRefreshedObjsForTarget(relevantProjTarget);
      res.status(200).json(relevantOrgObjs);
    } catch (error) {
      let errorMessage = `Error when fetching organizational object data for project: ${error.stack}`;
      console.error(errorMessage);
      res.status(500).json(errorMessage);
    }
  }
);
