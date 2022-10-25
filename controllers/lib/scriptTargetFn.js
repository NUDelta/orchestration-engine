/**
 * This file has functions for defining script targets.
 *
 * All functions must return the following object:
 * {
 *  students: [list of student names],
 *  projects: [list of project names]
 * }
 */

import { studioAPIUrl } from "../../index.js";
import got from "got";

/**
 * Returns all projects in the studio, and the students on them.
 * @return {Promise<{projects: *[], students}>}
 */
export const getAllProjects = async function() {
  let projResponse;

  try {
    let response = await got.get(
      `${ studioAPIUrl }/projects/`,
      {
        responseType: 'json'
      });

    projResponse = response.body;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
  }

  // return an object with { students: [student1Name, student2Name...], project: projName }
  return projResponse.map((proj) => {
    return {
      students: proj.students.map((currStudent) => {
        return currStudent.name
      }),
      project: proj.name
    }
  });
};

/**
 * Returns all projects in a sig, and the students on those projects.
 * @param sigName
 * @return {Promise<*[]>}
 */
export const getProjectsInSig = async function(sigName) {
  // TODO: all the logic in this function needs to be a controller
  return await getStudentsInSig(sigName);
};

export const getNonPhdProjects = async function () {
  let projectObjs;
  let filteredProjs;

  let output = [];

  try {
    // get all projects
    let response = await got.get(
      `${ studioAPIUrl }/projects/`,
      {
        responseType: 'json'
      });
    projectObjs = response.body;

    // filter projects based on sig
    filteredProjs = projectObjs.filter((projectObj) => {
      return projectObj.sig_name !== "Summer BBQ";
    });


    output = filteredProjs.map((currProj) => {
      return {
        students: currProj.students.map(
          (currStudent) => {
            return currStudent.name
          }),
        project: currProj.name
      }
    });

  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
  }

  return output;
};

/**
 * Returns all students in the studio, and their projects.
 * @return {Promise<{projects: *[], students}>}
 */
export const getAllStudents = async function() {
  let studentObjs;
  let projectObjs;

  let studentNames;
  let projectNames;

  try {
    // get all student objs
    studentObjs = await getAllStudentObjs();
    studentNames = studentObjs.map((studentObj) => {
      return studentObj.name;
    });

    // get all project objs
    projectObjs = await getAllProjectObjsForStudentList(studentNames);
    projectNames = projectObjs.map((projResponse) => {
      return projResponse.name;
    });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
  }

  return {
    students: studentNames,
    projects: projectNames
  };
};

/**
 * Returns all students in a sig, and their projects.
 * @param sigName string SIG to get students and projects in.
 * @return {Promise<*[]>}
 */
export const getStudentsInSig = async function(sigName) {
  let projectObjs;
  let filteredProjs;

  let output = [];

  // TODO: need to check if the SIG name is valid first
  try {
    // TODO: this should really be a route in the Studio API
    // get all projects
    let response = await got.get(
      `${ studioAPIUrl }/projects/`,
      {
        responseType: 'json'
      });
    projectObjs = response.body;

    // filter projects based on sig
    filteredProjs = projectObjs.filter((projectObj) => {
      return projectObj.sig_name === sigName;
    });


    output = filteredProjs.map((currProj) => {
      return {
        students: currProj.students.map(
          (currStudent) => {
            return currStudent.name
          }),
        project: currProj.name
      }
    });

  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
  }

  return output;
};

/**
 * Returns all non-Ph.D. students (i.e., masters and undergrads) in the studio, and their projects.
 * @return {Promise<{projects: *[], students}>}
 */
export const getNonPhdStudents = async function() {
  let studentObjs;
  let projectObjs;

  let studentNames;
  let projectNames;

  try {
    // get all student objs
    studentObjs = await getAllStudentObjs();
    studentNames = studentObjs.filter((studentObj) => {
      return studentObj.role === "NonPhdStudent";
    }).map((studentObj) => {
      return studentObj.name;
    });

    // get all project objs
    projectObjs = await getAllProjectObjsForStudentList(studentNames);
    projectNames = projectObjs.map((projResponse) => {
      return projResponse.name;
    });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
  }

  return {
    students: studentNames,
    projects: projectNames
  };
};


/**
 * Returns all Ph.D. students in the studio, and their projects.
 * @return {Promise<{projects: *[], students}>}
 */
export const getPhdStudents = async function() {
  let studentObjs;
  let projectObjs;

  let studentNames;
  let projectNames;

  try {
    // get all student objs
    studentObjs = await getAllStudentObjs();
    studentNames = studentObjs.filter((studentObj) => {
      return studentObj.role === "PhdStudent";
    }).map((studentObj) => {
      return studentObj.name;
    });

    // get all project objs
    projectObjs = await getAllProjectObjsForStudentList(studentNames);
    projectNames = projectObjs.map((projResponse) => {
      return projResponse.name;
    });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
  }

  return {
    students: studentNames,
    projects: projectNames
  };
};


/**
 * Returns all faculty in the studio. Projects is left empty.
 * @return {Promise<{projects: *[], students}>}
 */
export const getFaculty = async function() {
  let facultyObjs;
  let facultyName;

  try {
    let facultyResponse = await got.get(
      `${ studioAPIUrl }/users/faculty`,
      {
        responseType: 'json'
      });
    facultyObjs = facultyResponse.body;

    facultyName = facultyObjs.map((facultyObj) => {
      return facultyObj.name;
    });
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
  }

  return {
    students: facultyName,
    projects: []
  };
};


/**
 * Return a list of student objects for all students in the community.
 * @return {Promise<*[]>}
 */
const getAllStudentObjs = async function() {
  let phdBody = [];
  let nonPhdBody = []

  try {
    // get phd students
    let phdResponse = await got.get(
      `${ studioAPIUrl }/users/phdstudents`,
      {
        responseType: 'json'
      });
    phdBody = phdResponse.body;

    // get non phd students
    let nonPhdResponse = await got.get(
      `${ studioAPIUrl }/users/nonphdstudents`,
      {
        responseType: 'json'
      });
    nonPhdBody = nonPhdResponse.body;
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
  }

  return [...phdBody, ...nonPhdBody];
};


/**
 * Returns a list of project objects for a list of student names.
 * @param studentNames
 * @return {Promise<*[]>}
 */
const getAllProjectObjsForStudentList = async function(studentNames) {
  let projResponses;

  try {
    // get a project for each student
    let projPromises = studentNames.map((studentName) => {
      return got.get(
        `${ studioAPIUrl }/projects/fetchProjectForPerson`,
        {
          searchParams: {
            personName: studentName
          },
          responseType: 'json'
        });
    });

    projResponses = await Promise.all(projPromises);
  } catch (error) {
    console.error(`Error in fetching data from Studio API: ${ error.stack }`);
  }

  // return only unique and non empty projects
  let uniqueProjectNames = new Set();
  let uniqueProjects = [];
  projResponses.forEach((projResponse) => {
    let currProjInfo = projResponse.body;

    // check if object is empty
    if (Object.keys(currProjInfo).length !== 0) {
      // check if the project's name is already tracked
      if (!uniqueProjectNames.has(currProjInfo.name)) {
        uniqueProjectNames.add(currProjInfo.name);
        uniqueProjects.push(currProjInfo);
      }
    }
  });

  return uniqueProjects;
};
