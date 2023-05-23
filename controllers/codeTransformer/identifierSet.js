/**
 * This file contains the set of identifiers used in the OS Programming Language.
 */

import * as feedbackFns from '../programmingLanguage/feedbackFunctions.js';
import * as predicateFns from '../programmingLanguage/predicateFunctions.js';
import * as timeHelperFns from '../programmingLanguage/timeHelperFunctions.js';

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

export const helperFunctionIdentifiers = new Set(
  Object.keys({ ...feedbackFns, ...predicateFns, ...timeHelperFns })
);
