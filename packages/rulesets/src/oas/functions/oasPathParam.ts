import type { JsonPath, Segment } from '@stoplight/types';
import type { IFunction, IFunctionResult } from '@stoplight/spectral-core';
import { isObject } from './utils/isObject';

const pathRegex = /(\{;?\??[a-zA-Z0-9_-]+\*?\})/g;

interface IParam {
  in?: string;
  name?: string;
  required?: boolean;
}

interface INamedPathParam {
  in: 'path';
  name: string;
  required?: boolean;
}

const isNamedPathParam = (p: IParam): p is INamedPathParam => {
  return p.in !== void 0 && p.in === 'path' && p.name !== void 0;
};

const isUnknownNamedPathParam = (
  p: IParam,
  path: Segment[],
  results: IFunctionResult[],
  seen: Record<string, unknown>,
): p is INamedPathParam => {
  if (!isNamedPathParam(p)) {
    return false;
  }

  if (p.required !== true) {
    results.push(generateResult(requiredMessage(p.name), path));
  }

  if (p.name in seen) {
    results.push(generateResult(uniqueDefinitionMessage(p.name), path));
    return false;
  }

  return true;
};

const ensureAllDefinedPathParamsAreUsedInPath = (
  path: string,
  params: Record<string, JsonPath>,
  expected: string[],
  results: IFunctionResult[],
): void => {
  for (const p of Object.keys(params)) {
    if (!params[p]) {
      continue;
    }

    if (!expected.includes(p)) {
      const resPath = params[p];
      results.push(generateResult(`Parameter "${p}" must be used in path "${path}".`, resPath));
    }
  }
};

const ensureAllExpectedParamsInPathAreDefined = (
  path: string,
  params: Record<string, Segment[]>,
  expected: string[],
  operationPath: Segment[],
  results: IFunctionResult[],
): void => {
  for (const p of expected) {
    if (!(p in params)) {
      results.push(
        generateResult(`Operation must define parameter "{${p}}" as expected by path "${path}".`, operationPath),
      );
    }
  }
};

export const oasPathParam: IFunction = targetVal => {
  /**
   * This rule verifies:
   *
   * 1. for every param referenced in the path string ie /users/{userId}, var must be defined in either
   *    path.parameters, or operation.parameters object
   * 2. every path.parameters + operation.parameters property must be used in the path string
   */

  if (!isObject(targetVal) || !isObject(targetVal.paths)) {
    return;
  }

  const results: IFunctionResult[] = [];

  // keep track of normalized paths for verifying paths are unique
  const uniquePaths: Record<string, unknown> = {};
  const validOperationKeys = ['get', 'head', 'post', 'put', 'patch', 'delete', 'options', 'trace'];

  for (const path of Object.keys(targetVal.paths)) {
    const pathValue = targetVal.paths[path];
    if (!isObject(pathValue)) continue;

    // verify normalized paths are functionally unique (ie `/path/{one}` vs `/path/{two}` are
    // different but equivalent within the context of OAS)
    const normalized = path.replace(pathRegex, '%'); // '%' is used here since its invalid in paths
    if (normalized in uniquePaths) {
      results.push(
        generateResult(`Paths "${String(uniquePaths[normalized])}" and "${path}" must not be equivalent.`, [
          'paths',
          path,
        ]),
      );
    } else {
      uniquePaths[normalized] = path;
    }

    // find all templated path parameters
    const pathElements: string[] = [];
    let match;

    while ((match = pathRegex.exec(path))) {
      const p = match[0].replace(/[{}?*;]/g, '');
      if (pathElements.includes(p)) {
        results.push(generateResult(`Path "${path}" must not use parameter "{${p}}" multiple times.`, ['paths', path]));
      } else {
        pathElements.push(p);
      }
    }

    // find parameters set within the top-level 'parameters' object
    const topParams = {};
    if (Array.isArray(pathValue.parameters)) {
      for (const [i, value] of pathValue.parameters.entries()) {
        if (!isObject(value)) continue;

        const fullParameterPath = ['paths', path, 'parameters', i];

        if (isUnknownNamedPathParam(value, fullParameterPath, results, topParams)) {
          topParams[value.name] = fullParameterPath;
        }
      }
    }

    if (isObject(targetVal.paths[path])) {
      // find parameters set within the operation's 'parameters' object
      for (const op of Object.keys(pathValue)) {
        const operationValue = pathValue[op];
        if (!isObject(operationValue)) continue;

        if (op === 'parameters' || !validOperationKeys.includes(op)) {
          continue;
        }

        const operationParams = {};
        const { parameters } = operationValue;
        const operationPath = ['paths', path, op];

        if (Array.isArray(parameters)) {
          for (const [i, p] of parameters.entries()) {
            if (!isObject(p)) continue;

            const fullParameterPath = [...operationPath, 'parameters', i];

            if (isUnknownNamedPathParam(p, fullParameterPath, results, operationParams)) {
              operationParams[p.name] = fullParameterPath;
            }
          }
        }

        const definedParams = { ...topParams, ...operationParams };
        ensureAllDefinedPathParamsAreUsedInPath(path, definedParams, pathElements, results);
        ensureAllExpectedParamsInPathAreDefined(path, definedParams, pathElements, operationPath, results);
      }
    }
  }

  return results;
};

function generateResult(message: string, path: JsonPath): IFunctionResult {
  return {
    message,
    path,
  };
}

const requiredMessage = (name: string) =>
  `Path parameter "${name}" must have "required" property that is set to "true".` as const;

const uniqueDefinitionMessage = (name: string) =>
  `Path parameter "${name}" must not be defined multiple times.` as const;

export default oasPathParam;
