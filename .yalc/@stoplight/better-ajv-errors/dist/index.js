'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var pointer = _interopDefault(require('jsonpointer'));
var leven = _interopDefault(require('leven'));

// @flow

/*::
import type { Error, Node } from './types';
*/

// Basic
const eq = x => y => x === y;
const not = fn => x => !fn(x);

// https://github.com/facebook/flow/issues/2221
const getValues = /*::<Obj: Object>*/ (
  o /*: Obj*/,
) /*: $ReadOnlyArray<$Values<Obj>>*/ => Object.values(o);

const notUndefined = (x /*: mixed*/) => x !== undefined;

// Error
const isXError = x => (error /*: Error */) => error.keyword === x;
const isAnyOfError = isXError('anyOf');
const isEnumError = isXError('enum');
const getErrors = (node /*: Node*/) => (node && node.errors) || [];

// Node
const getChildren = (node /*: Node*/) /*: $ReadOnlyArray<Node>*/ =>
  (node && getValues(node.children)) || [];

const getSiblings = (parent /*: Node*/) => (
  node /*: Node*/,
) /*: $ReadOnlyArray<Node>*/ => getChildren(parent).filter(not(eq(node)));

const concatAll = /*::<T>*/ (xs /*: $ReadOnlyArray<T>*/) => (
  ys /*: $ReadOnlyArray<T>*/,
) /*: $ReadOnlyArray<T>*/ => ys.reduce((zs, z) => zs.concat(z), xs);

function getLastSegment(instancePath) {
  const index = instancePath.lastIndexOf('/');
  if (index !== -1) {
    return instancePath.slice(index + 1);
  }

  return null;
}

const QUOTES = /['"]/g;
const NOT = /NOT/g;
const FIRST_LETTER = /^[a-z]/;

function cleanAjvMessage(word) {
  return word.replace(QUOTES, '`').replace(NOT, 'not');
}

function toUpperCase(word) {
  return word.toUpperCase();
}

function capitalize(word) {
  return word.replace(FIRST_LETTER, toUpperCase);
}

class BaseValidationError {
  constructor(
    options = { isIdentifierLocation: false },
    { data, schema, propPath },
  ) {
    this.options = options;
    this.data = data;
    this.schema = schema;
    this.propPath = propPath;
  }

  getError() {
    throw new Error(
      `Implement the 'getError' method inside ${this.constructor.name}!`,
    );
  }

  getPrettyPropertyName(dataPath) {
    const propName = this.getPropertyName(dataPath);

    if (propName === null) {
      return capitalize(typeof this.getPropertyValue(dataPath));
    }

    return `\`${propName}\` property`;
  }

  getPropertyName(path) {
    const propName = getLastSegment(path);
    if (propName !== null) {
      return propName;
    }

    if (this.propPath.length === 0) {
      return null;
    }

    return this.propPath[this.propPath.length - 1];
  }

  getPropertyValue(path) {
    return path === '' ? this.data : pointer.get(this.data, path);
  }
}

class RequiredValidationError extends BaseValidationError {
  getError() {
    const { message, instancePath } = this.options;

    return {
      error: `${this.getPrettyPropertyName(instancePath)} ${cleanAjvMessage(
        message,
      )}`,
      path: instancePath,
    };
  }
}

class AdditionalPropValidationError extends BaseValidationError {
  constructor(...args) {
    super(...args);
  }

  getError() {
    const { params, instancePath } = this.options;

    return {
      error: `Property \`${params.additionalProperty}\` is not expected to be here`,
      path: instancePath,
    };
  }
}

class EnumValidationError extends BaseValidationError {
  getError() {
    const { message, instancePath, params } = this.options;
    const bestMatch = this.findBestMatch();

    const output = {
      error: `${this.getPrettyPropertyName(
        instancePath,
      )} ${message}: ${params.allowedValues
        .map(value =>
          typeof value === 'string' ? `\`${value}\`` : JSON.stringify(value),
        )
        .join(', ')}`,
      path: instancePath,
    };

    if (bestMatch !== null) {
      output.suggestion = `Did you mean \`${bestMatch}\`?`;
    }

    return output;
  }

  findBestMatch() {
    const {
      instancePath,
      params: { allowedValues },
    } = this.options;

    const currentValue = this.getPropertyValue(instancePath);

    if (typeof currentValue !== 'string') {
      return null;
    }

    const matches = allowedValues
      .filter(value => typeof value === 'string')
      .map(value => ({
        value,
        weight: leven(value, currentValue.toString()),
      }))
      .sort((x, y) => (x.weight > y.weight ? 1 : x.weight < y.weight ? -1 : 0));

    if (matches.length === 0) {
      return null;
    }

    const bestMatch = matches[0];

    return allowedValues.length === 1 ||
      bestMatch.weight < bestMatch.value.length
      ? bestMatch.value
      : null;
  }
}

class DefaultValidationError extends BaseValidationError {
  getError() {
    const { message, instancePath } = this.options;

    return {
      error: `${this.getPrettyPropertyName(instancePath)} ${cleanAjvMessage(
        message,
      )}`,
      path: instancePath,
    };
  }
}

class TypeValidationError extends BaseValidationError {
  getError() {
    const { message, instancePath } = this.options;

    const propertyName = this.getPropertyName(instancePath);

    return {
      error:
        propertyName === null
          ? `Value type ${message}`
          : `\`${propertyName}\` property type ${message}`,
      path: instancePath,
    };
  }
}

const JSON_POINTERS_REGEX = /\/[\w_-]+(\/\d+)?/g;

// Make a tree of errors from ajv errors array
function makeTree(ajvErrors = []) {
  const root = { children: {} };
  ajvErrors.forEach(ajvError => {
    const { instancePath } = ajvError;

    // `instancePath === ''` is root
    const paths =
      instancePath === '' ? [''] : instancePath.match(JSON_POINTERS_REGEX);
    paths &&
      paths.reduce((obj, path, i) => {
        obj.children[path] = obj.children[path] || { children: {}, errors: [] };
        if (i === paths.length - 1) {
          obj.children[path].errors.push(ajvError);
        }
        return obj.children[path];
      }, root);
  });
  return root;
}

function filterRedundantErrors(root, parent, key) {
  /**
   * If there is an `anyOf` error that means we have more meaningful errors
   * inside children. So we will just remove all errors from this level.
   *
   * If there are no children, then we don't delete the errors since we should
   * have at least one error to report.
   */
  if (getErrors(root).some(isAnyOfError)) {
    if (Object.keys(root.children).length > 0) {
      delete root.errors;
    }
  }

  /**
   * If all errors are `enum` and siblings have any error then we can safely
   * ignore the node.
   *
   * **CAUTION**
   * Need explicit `root.errors` check because `[].every(fn) === true`
   * https://en.wikipedia.org/wiki/Vacuous_truth#Vacuous_truths_in_mathematics
   */
  if (root.errors && root.errors.length && getErrors(root).every(isEnumError)) {
    if (
      getSiblings(parent)(root)
        // Remove any reference which becomes `undefined` later
        .filter(notUndefined)
        .some(getErrors)
    ) {
      delete parent.children[key];
    }
  }

  Object.entries(root.children).forEach(([key, child]) =>
    filterRedundantErrors(child, root, key),
  );
}

function createErrorInstances(root, options) {
  const errors = getErrors(root);
  if (errors.length && errors.every(isEnumError)) {
    const uniqueValues = new Set(
      concatAll([])(errors.map(e => e.params.allowedValues)),
    );
    const allowedValues = [...uniqueValues];
    const error = errors[0];
    return [
      new EnumValidationError(
        {
          ...error,
          params: { allowedValues },
        },
        options,
      ),
    ];
  } else {
    return concatAll(
      errors.reduce((ret, error) => {
        switch (error.keyword) {
          case 'additionalProperties':
            return ret.concat(
              new AdditionalPropValidationError(error, options),
            );
          case 'required':
            return ret.concat(new RequiredValidationError(error, options));
          case 'type':
            return ret.concat(new TypeValidationError(error, options));
          default:
            return ret.concat(new DefaultValidationError(error, options));
        }
      }, []),
    )(getChildren(root).map(child => createErrorInstances(child, options)));
  }
}

var prettify = (ajvErrors, options) => {
  const tree = makeTree(ajvErrors || []);
  filterRedundantErrors(tree);
  return createErrorInstances(tree, options);
};

const customErrorToStructure = error => error.getError();

var index = (schema, errors, { propertyPath, targetValue }) => {
  const customErrors = prettify(errors, {
    data: targetValue,
    schema,
    propPath: propertyPath,
  });

  return customErrors.map(customErrorToStructure);
};

module.exports = index;
