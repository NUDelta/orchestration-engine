/**
 * This file contains functions to transpile code into a format the OS engine can understand using babel.
 *
 * Currently, this includes adding async/await flags and this keywords to code.
 */

import babel from '@babel/core';
import { addAsyncAwaitPlugin, addThisPlugin } from './babelPlugins.js';

/**
 * Transforms input code based on the babel configuration passed in.
 * @param {string} code: block of code to tranform.
 * @param {object} config: babel configuration with plugins that is used to transform the code.
 */
export const transformOSCode = function (code, config) {
  let output = babel.transformSync(code, config);
  return output.code;
};

/**
 * Babel configuration that adds async/await flags, and this keywords to OS code.
 */
export const asyncThisConfig = {
  plugins: [addAsyncAwaitPlugin, addThisPlugin],

  // keep any white space so code stays pretty
  retainLines: true,
};
