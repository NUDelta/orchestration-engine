/**
 * This file contains the babel plugins used to transform the OS Programming Language by adding async/await flags and this keywords.
 */

import * as t from '@babel/types';
import {
  organizationalObjectIdenfifiers,
  helperFunctionIdentifiers,
} from './identifierSet';

/**
 * Adds async/await to all helper functions in the OS Programming Language
 * @returns {{pre(): void, visitor: {FunctionDeclaration(*): void, FunctionExpression(*): void, CallExpression(*): void}}}
 */
export const addAsyncAwaitPlugin = function () {
  return {
    pre() {
      // only need to add async/await flags to functions
      this.helperFnsIdentifiers = helperFunctionIdentifiers;
    },

    visitor: {
      // make functions async
      FunctionDeclaration(path) {
        path.node.async = true;
      },

      // make functions async
      FunctionExpression(path) {
        path.node.async = true;
      },

      // make any calls to OS functions async
      CallExpression(path) {
        // check if the call is not already async before adding the await block
        if (!t.isAwaitExpression(path.parentPath.node)) {
          // get callee
          let callee = path.node.callee;
          let expressionName = '';

          // check if callee is a member expression or identifier
          if (t.isIdentifier(callee)) {
            expressionName = callee.name;
          } else if (t.isMemberExpression(callee)) {
            expressionName = callee.property.name;
          }

          // make an async call if the function is an OS Helper function
          if (this.helperFnsIdentifiers.has(expressionName)) {
            path.replaceWith(t.awaitExpression(path.node));
          }
        }
      },
    },
  };
};

/**
 * Adds this keyword to all OS objects and helper functions
 * @returns {{pre(): void, visitor: {MemberExpression(*): void, Identifier: {exit(*): void}, CallExpression(*): void}}}
 */
export const addThisPlugin = function () {
  return {
    pre() {
      this.orgObjIdentifiers = organizationalObjectIdenfifiers;
      this.helperFnsIdentifiers = helperFunctionIdentifiers;
    },

    visitor: {
      // check if the child of the member expression is an identifier
      MemberExpression(path) {
        if (t.isIdentifier(path.node.object)) {
          // check if the identifier is not a local variable
          if (!path.scope.hasBinding(path.node.object.name)) {
            let identifierString = path.node.object.name;

            // check if either a variable from OS
            if (this.orgObjIdentifiers.has(identifierString)) {
              // add this. to org objects
              path.replaceWith(
                t.memberExpression(
                  t.memberExpression(t.thisExpression(), path.node.object),
                  path.node.property
                )
              );
            }
          }
        }
      },

      // on exit (after the node has been visted), check if identifier is a member expression
      Identifier: {
        exit(path) {
          if (!t.isMemberExpression(path.parentPath.node)) {
            // add "this" keyword if it's a Org Object or a helper function
            if (
              this.orgObjIdentifiers.has(path.node.name) ||
              this.helperFnsIdentifiers.has(path.node.name)
            ) {
              path.replaceWith(
                t.memberExpression(t.thisExpression(), path.node)
              );
            }
          }
        },
      },

      // add this. to OS helper functions
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          // get callee
          let callee = path.node.callee;
          let expressionName = '';

          // check if callee is a member expression or identifier
          if (t.isIdentifier(callee)) {
            expressionName = callee.name;
          } else if (t.isMemberExpression(callee)) {
            expressionName = callee.property.name;
          }

          if (this.helperFnsIdentifiers.has(expressionName)) {
            // replace the path this.<expression>
            path.replaceWith(
              t.callExpression(
                t.memberExpression(t.thisExpression(), path.node.callee),
                path.node.arguments
              )
            );
          }
        }
      },
    },
  };
};
