import { Segment } from '@stoplight/types';
import { IFunction, IFunctionResult } from '../../../types';

const pathRegex = /(\{[a-zA-Z0-9_-]+\})+/g;

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
  seens: Array<Record<string, unknown>>,
): p is INamedPathParam => {
  if (!isNamedPathParam(p)) {
    return false;
  }

  if (!p.required) {
    results.push(generateResult(requiredMessage(p.name), path));
  }

  for (const seen of seens) {
    if (p.name in seen) {
      results.push(generateResult(uniqueDefinitionMessage(p.name), path));
      return false;
    }
  }

  return true;
};

const ensureAllDefinedPathParamsAreUsedInPath = (
  path: string,
  params: Record<string, Segment[]>,
  expected: Record<string, unknown>,
  results: IFunctionResult[],
) => {
  for (const p in params) {
    if (!params[p]) {
      continue;
    }

    if (!(p in expected)) {
      const resPath = params[p];
      results.push(generateResult(`Parameter \`${p}\` is not used in the path \`${path}\`.`, resPath));
    }
  }
};

const ensureAllExpectedParamsinPathAreDefined = (
  path: string,
  params: Record<string, Segment[]>,
  expected: Record<string, unknown>,
  operationPath: Segment[],
  results: IFunctionResult[],
) => {
  for (const p in expected) {
    if (!expected[p]) {
      continue;
    }

    if (!(p in params)) {
      results.push(
        generateResult(
          `The operation does not define the parameter \`{${p}}\` expected by path \`${path}\`.`,
          operationPath,
        ),
      );
    }
  }
};

export const oasPathParam: IFunction = (targetVal, _options, paths, vals) => {
  const results: IFunctionResult[] = [];

  const { original: object } = vals;

  /**
   * This rule verifies:
   *
   * 1. for every param referenced in the path string ie /users/{userId}, var must be defined in either
   *    path.parameters, or operation.parameters object
   * 2. every path.parameters + operation.parameters property must be used in the path string
   */

  if (!object.paths) {
    return [];
  }

  // keep track of normalized paths for verifying paths are unique
  const uniquePaths: object = {};

  for (const path in object.paths) {
    if (!object.paths[path]) continue;

    // verify normalized paths are functionally unique (ie `/path/{one}` vs `/path/{two}` are
    // different but equivalent within the context of OAS)
    const normalized = path.replace(pathRegex, '%'); // '%' is used here since its invalid in paths
    if (uniquePaths[normalized]) {
      results.push(
        generateResult(`The paths \`${uniquePaths[normalized]}\` and \`${path}\` are equivalent.`, [
          ...paths.given,
          'paths',
          path,
        ]),
      );
    } else {
      uniquePaths[normalized] = path;
    }

    // find all templated path parameters
    const pathElements = {};
    while (true) {
      const match = pathRegex.exec(path);

      if (match && match.length > 0) {
        const p = match[0].replace(/[\{\}]/g, '');
        if (pathElements[p]) {
          results.push(
            generateResult(
              `The path \`${path}\` uses the parameter \`{${p}}\` multiple times. Path parameters must be unique.`,
              [...paths.given, 'paths', path],
            ),
          );
        } else {
          pathElements[p] = {};
        }
        continue;
      }
      break;
    }

    // find parameters set within the top-level 'parameters' object
    const topParams = {};
    for (const i in object.paths[path].parameters) {
      if (!object.paths[path].parameters[i]) continue;

      const p: IParam = object.paths[path].parameters[i];
      const fullParameterPath = [...paths.given, 'paths', path, 'parameters', i];

      if (isUnknownNamedPathParam(p, fullParameterPath, results, [topParams])) {
        topParams[p.name] = fullParameterPath;
      }
    }

    for (const op in object.paths[path]) {
      if (!object.paths[path][op]) continue;

      if (op === 'parameters') {
        continue;
      }

      const operationParams = {};
      const parameters = object.paths[path][op].parameters;

      const operationPath = [...paths.given, 'paths', path, op];

      for (const i in parameters) {
        if (!parameters.hasOwnProperty(i)) continue;

        const p: IParam = parameters[i];
        const fullParameterPath = [...operationPath, 'parameters', i];

        if (isUnknownNamedPathParam(p, fullParameterPath, results, [topParams, operationParams])) {
          operationParams[p.name] = fullParameterPath;
        }
      }

      const definedParams = { ...topParams, ...operationParams };
      ensureAllDefinedPathParamsAreUsedInPath(path, definedParams, pathElements, results);
      ensureAllExpectedParamsinPathAreDefined(path, definedParams, pathElements, operationPath, results);
    }
  }

  return results;
};

function generateResult(message: string, path: Array<string | number>): IFunctionResult {
  return {
    message,
    path,
  };
}

const requiredMessage = (name: string) =>
  `Path parameter \`${name}\` must have a \`required\` property that is set to \`true\`.`;

const uniqueDefinitionMessage = (name: string) =>
  `Path parameter \`${name}\` is defined multiple times. Path parameters must be unique.`;

export default oasPathParam;
