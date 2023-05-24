/**
 * This file contains the set of identifiers used in the OS Programming Language.
 */

import * as feedbackFns from '../programmingLanguage/feedbackFunctions.js';
import * as predicateFns from '../programmingLanguage/predicates.js';
import * as timeHelperFns from '../programmingLanguage/timeHelpers.js';

// create a set for all Organizational Object identifiers
export const organizationalObjectIdenfifiers = new Set([
  'projects',
  'people',
  'processes',
  'socialStructures',
  'venues',
  'project',
  'person',
  'process',
  'socialStructure',
  'venue',
]);

// create a set for all helper function identifiers
export const helperFunctionIdentifiers = new Set(
  Object.keys({ ...feedbackFns, ...predicateFns, ...timeHelperFns })
);
