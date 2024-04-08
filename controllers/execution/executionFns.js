// TODO: need to catch errors if things fail

// execution helpers
import { ExecutionEnv } from './executionEnv.js';
import { floorDateToNearestFiveMinutes } from '../../imports/utils.js';

// data fetchers
import {
  getAllProjects,
  getProjectByName,
  getProjectForPerson,
  getProjectsForPeople,
} from '../dataFetchers/fetchProjects.js';
import { getAllPeople } from '../dataFetchers/fetchPeople.js';
import { getAllProcesses } from '../dataFetchers/fetchProcesses.js';
import {
  getAllSocialStructures,
  getSocialStructuresForProject,
} from '../dataFetchers/fetchSocialStructures.js';
import {
  getAllVenues,
  getVenuesForProject,
  getVenuesForSig,
} from '../dataFetchers/fetchVenues.js';

// TODO: error checking
// TODO: fix name
/**
 * Fetches all organization data objects form the Studio API.
 * @returns {Promise<{processes: [], projects: [], venues: [], socialStructures: [], people: []}>}
 */
export async function fetchAlOrgObjs() {
  // fetch and return all organization objects
  return {
    projects: await getAllProjects(),
    people: await getAllPeople(),
    processes: await getAllProcesses(),
    socialStructures: await getAllSocialStructures(),
    venues: await getAllVenues(),
  };
}

/**
 * Computes applicable set of organization objects that a script will be run on.
 * @param applicableSetFn function to run to generate list of organization objects that make up the
 * applicable set. Typically, these functions will be filters on the existing organization objects.
 * @returns {Promise<[]>} promise that, when resolved, returns a list of organization objects.
 */
export async function computeApplicableSet(applicableSetFn) {
  // get all targets
  let allOrgObjs = await fetchAlOrgObjs();

  // compute applicable subset
  let targetExecEnv = new ExecutionEnv(allOrgObjs, applicableSetFn);
  return await targetExecEnv.runScript();
}

/**
 * Fetches organization objects from the Studio API that are relevant to the current target of a script.
 * TODO: only project types are implemented right now.
 * @param currTarget object the current organization object the orchestration script is being evaluated on.
 * @returns {Promise<{processes: [], project, venues: [], socialStructures: []}>}
 */
export async function getRefreshedObjsForTarget(currTarget) {
  let newObjs;
  let targetType = currTarget.targetType;

  // TODO: should processes be current processes?
  switch (targetType) {
    case 'project':
      newObjs = {
        project: currTarget,
        processes: await getAllProcesses(),
        socialStructures: await getSocialStructuresForProject(currTarget.name),
        venues: await getVenuesForProject(currTarget.name),
      };
      break;
    case 'person':
      break;
    case 'process':
      break;
    case 'social structure':
      newObjs = {
        projects: await getProjectsForPeople(
          currTarget.members.map((person) => {
            return person.name;
          })
        ),
        processes: await getAllProcesses(),
        socialStructure: currTarget,
        venues: await getVenuesForSig(currTarget.name),
      };
      break;
    case 'venue':
      break;
  }

  return newObjs;
}

// TODO: there needs to be one layer of abstraction higher where you iterate over all
// all the targets once the functions are being used to compute them.
// Then for each target that the script triggers for, save it out as an issue that later parts of
// the code will use.

// TODO: need to catch errors if things fail
/**
 * Used to run detector condition for an orchestration script.
 * @param orgObj object containing all the data from the organization that is relevant to the current target.
 * @param situationDetector function that evaluates whether an orchestration script should run.
 * @return {Promise<boolean>} promise that, if resolved, will be true if the situationDetector is fulfilled.
 */
export async function executeSituationDetector(orgObj, situationDetector) {
  // create script execution environment and run script
  let scriptExecutionEnv = new ExecutionEnv(orgObj, situationDetector);
  return await scriptExecutionEnv.runScript();
}

/**
 * Used to run trigger function for actionable feedback in orchestration scripts.
 * @param orgObj object containing all the data from the organization that is relevant to the current target.
 * @param strategies list of strategy objects to evaluate.
 * @return {Promise<*[]>} promise that, if resolved, will be a list of computed strategies.
 */
export async function executeStrategies(orgObj, strategies) {
  // compute when each feedback opportunity should be executed
  let computedStrategies = [];
  for (let strategyItemIndex in strategies) {
    // get current feedback opportunity
    let currStrategy = strategies[strategyItemIndex];

    // TODO: handle cases where the opportunity is undefined
    // try to compute opportunity, if it exists
    try {
      // create execution envs for computing trigger date and feedback outlets
      let strategyFnRunner = new ExecutionEnv(
        orgObj,
        currStrategy.strategy_function
      );

      // get opportunity fn, output fn, and args for the output fn
      let { opportunity_fn, outlet_fn, outlet_args } =
        await strategyFnRunner.runScript();

      // compute the opportunity
      let opportunityFnRunner = new ExecutionEnv(orgObj, opportunity_fn);
      let computedOpportunity = await opportunityFnRunner.runScript();

      // floor to nearest 5 minutes to make sure any drift on server doesn't prevent matching
      let flooredComputedOpportunity =
        floorDateToNearestFiveMinutes(computedOpportunity);

      // TODO: may want to add a "delivery" field here to indicate how the feedback should be delivered (e.g., in summary, message over slack, shown in tool)
      // add computed strategies
      computedStrategies.push({
        opportunity: flooredComputedOpportunity,
        outlet_fn: outlet_fn,
        outlet_args: outlet_args,
      });
    } catch (error) {
      console.error(
        `Error in computing opportunity: \nOrg Object: ${JSON.stringify(
          orgObj,
          null,
          4
        )}\nStrategy: ${JSON.stringify(currStrategy, null, 4)}`
      );
    }
  }

  return computedStrategies;
}
