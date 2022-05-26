/*
  TODO: Types of predicates
  - equality for primitives (string, number, date, boolean)
  - equality for lists values
  - equality for lists of objects --> every object.key in a list matches
 */

/**
 * Generates a predicate that checks whether a string field's value matches an input.
 * @param matchValue string name of target object.
 * @param objectKey optional string key in object to match for. If none provided, top-level object is compared.
 * @returns {function} predicate function, such as:
 * (name="") => (target) => {
 *   return target.name === name;
 * }
 */
export const generateEqualityPredicate = (objectKey="") => {
  // configure what property of the object
  let objectAccessor = objectKey === "" ? "target" : `target.${ objectKey }`;

  // create predicate as text
  // match value is sent as a
  let testPredicate = `(value="") => (target) => {
    return ${ objectAccessor } === value;
  };`

  // eval and return
  return eval(testPredicate);
};

// TOOD: maybe have a predicate that checks if in list
// ex: nameOneOf(["asdasd", "asdasd", "asdasd"])

// TODO: maybe a predicate for all that applies to list values?
// ex: roleAreAll("NonPhdStudent", "student") { return target.students.every(roleIs("NonPhdStudent")) }

