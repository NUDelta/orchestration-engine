import { Router } from 'express';
import {
  getAllProjects,
  getProjectByName,
  getProjectForPerson,
} from '../controllers/dataFetchers/fetchProjects.js';
import {
  getFirst,
  getLast,
} from '../controllers/programmingLanguage/timeHelpers.js';
import {
  isDayOf,
  isDayOfVenue,
  isWeekOf,
  where,
  whereAll,
  whereSome,
} from '../controllers/programmingLanguage/predicates.js';
import { DateTime } from 'luxon';
import {
  getAllPeople,
  getPersonByName,
} from '../controllers/dataFetchers/fetchPeople.js';
import {
  getAllProcesses,
  getCurrentProcesses,
} from '../controllers/dataFetchers/fetchProcesses.js';
import {
  getAllVenues,
  getVenuesForPerson,
  getVenuesForProject,
  getVenuesForSig,
} from '../controllers/dataFetchers/fetchVenues.js';
import {
  getAllSocialStructures,
  getSocialStructuresForPerson,
  getSocialStructuresForProject,
} from '../controllers/dataFetchers/fetchSocialStructures.js';
import {
  computeApplicableSet,
  getRefreshedObjsForTarget,
} from '../controllers/execution/executionFns.js';

import {
  thisAfternoon,
  thisEvening,
  tomorrowMorning,
  tomorrowAfternoon,
  tomorrowEvening,
} from '../controllers/programmingLanguage/timeHelpers.js';

export const testerRouter = new Router();

testerRouter.get('/projects', async (req, res) => {
  // console.log(generatePredicate("name", "project").toString());
  // console.log(nameIs)
  // console.log(testPredicate)

  let projects = await getAllProjects();
  // console.log(projects.helpers)
  //
  //
  // console.log(projects.filter(projects.helpers.nameIs("Orchestration Scripting Environments")));
  //
  // console.log(projects.filter(projects.helpers.sigHeadNameIs("Kapil Garg")));
  //
  // console.log(await getFirst({ name: "Collective Experiences SIG Office Hours for Collective Experiences Relationship Dev"}))
  // console.log(await getLast({ name: "Collective Experiences SIG Office Hours for Collective Experiences Relationship Dev"}))
  //
  // console.log(await isDayOfVenue({
  //   name: "Agile Research Studios SIG Meeting",
  //   description: "Weekly SIG meeting for ARS SIG",
  //   day_of_week: "Thursday",
  //   start_time: "13:00:00",
  //   end_time: "14:00:00",
  //   timezone: "America/Chicago",
  //   attendees: [],
  //   projects: [
  //     "MindYoga"
  //   ],
  // }));
  //
  // console.log(await isDayOf(
  //   (await getFirst({ name: "Collective Experiences SIG Office Hours for Collective Experiences Relationship Dev"})).start_time
  // ))
  //
  // console.log(await isDayOf(
  //   (await getFirst({ name: "Agile Research Studios SIG Meeting"})).start_time
  // ))
  //
  // console.log(await isWeekOf(new Date("2022-05-28T20:00:00.000Z")))

  // fetching projects for a SIG head
  // res.json(projects.filter(where(
  //   "sigHead.name",
  //   "Gobi Dasu"
  // )));

  // fetching projects for a sig
  res.json(projects.filter(where('sig', 'Collective Experiences')));

  // fetching projects where a student is in the list of people
  // res.json(projects.filter(whereSome(
  //   "students",
  //   "name",
  //   "Jason Friedman"
  // )));

  // fetching projects where students are in some list
  // res.json(projects.filter(whereSome(
  //   "students",
  //   "name",
  //   ["Jason Friedman", "Jonathan Liu", "Molly Pribble"]
  // )));

  // fetching projects where project names are in some list
  // res.json(projects.filter(where(
  //   "name",
  //   ["MindYoga", "Kapil Proj"],
  // )));
});

testerRouter.get('/people', async (req, res) => {
  // get all people
  // res.json(await getAllPeople());

  // get person by name
  // res.json(await getPersonByName("Haoqi Zhang"));

  // people who are non-phd students
  // res.json((await getAllPeople()).filter(where("role", "NonPhdStudent")))

  // people who are phd students
  res.json(await getAllPeople());
});

testerRouter.get('/processes', async (req, res) => {
  // get all processes
  // res.json(await getAllProcesses());

  // get the current processes
  // res.json(await getCurrentProcesses());

  // filter for sprint 3
  res.json((await getAllProcesses()).filter(where('name', 'Sprint 3')));
});

testerRouter.get('/venues', async (req, res) => {
  // get all venues
  // res.json(await getAllVenues());

  // get venues for a project
  // res.json(await getVenuesForProject("Scaffolded Exercises"));

  // get venues for a person
  // res.json(await getVenuesForPerson("Richard Lam"))

  // get venues for a sig
  // res.json(await getVenuesForSig("Collective Experiences"))

  // filter for office hours
  // res.json((await getVenuesForProject("CE for Relationship Development")).filter(where("kind", "OfficeHours")));

  res.json(
    (await getVenuesForProject('CE for Relationship Development')).find(
      where('kind', 'OfficeHours')
    )
  );
});

testerRouter.get('/socialStructures', async (req, res) => {
  // get all social structures
  res.json(await getAllSocialStructures());

  // get social structures for a person
  // res.json(await getSocialStructuresForPerson("Cindy Hu"));

  // get social structures for a project
  // res.json(await getSocialStructuresForProject("CE for Relationship Development"));
});

testerRouter.get('/execution', async (req, res) => {
  // console.log(await computeApplicableSet(async function() {
  //   return this.projects.filter(this.whereAll("students", "role", "NonPhdStudent"));
  // }))
  res.json(
    await getRefreshedObjsForTarget(
      (
        await getSocialStructuresForProject('CE for Relationship Development')
      )[0]
    )
  );
});

testerRouter.get('/timeAtDate', async (req, res) => {
  // get the timestamp, timezone
  const { timestamp, timezone } = req.query;
  return res.json({
    thisAfternoon: await thisAfternoon(timestamp, timezone),
    thisEvening: await thisEvening(timestamp, timezone),
    tomorrowMorning: await tomorrowMorning(timestamp, timezone),
    tomorrowAfternoon: await tomorrowAfternoon(timestamp, timezone),
    tomorrowEvening: await tomorrowEvening(timestamp, timezone),
  });
});
