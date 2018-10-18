import {
  IRuleFunction,
  IRuleMetadata,
  IRuleOpts,
  IRuleResult,
  Rule,
  RuleSeverity,
} from '../../../../types';

const pathRegex = /(\{[a-zA-Z0-9_-]+\})+/g;

export const oasPathParam: IRuleFunction<Rule> = (opts: IRuleOpts<Rule>) => {
  const results: IRuleResult[] = [];

  let { object } = opts;
  const { resObj, rule, meta } = opts;

  if (!resObj) {
    console.warn(
      'oasPathParam expects a resolved object, but none was provided. Results may not be correct.'
    );
  } else {
    object = resObj;
  }

  /**
   * This rule verifies:
   *
   * 1. for every param defined in the path string ie /users/{userId}, var must be defined in either
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
        generateResult(
          `The paths "**${uniquePaths[normalized]}**" and "**${path}**" are equivalent.

To fix, remove one of the paths or merge them together.`,
          [...meta.path, 'paths'],
          rule,
          meta
        )
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
              `The path "**${path}**" uses the parameter "**{${p}}**" multiple times.

Path parameters must be unique.

To fix, update the path so that all parameter names are unique.`,
              [...meta.path, 'paths', path],
              rule,
              meta
            )
          );
        } else {
          pathElements[p] = {};
        }
        continue;
      }
      break;
    }

    // find parameters set within the top-level 'parameters' object
    const topParams: object = {};
    if (object.paths[path].parameters) {
      for (const p of object.paths[path].parameters) {
        if (p.in && p.in === 'path' && p.name) {
          if (!p.required) {
            results.push(
              generateResult(
                requiredMessage(p.name),
                [...meta.path, 'paths', path, 'parameters'],
                rule,
                meta
              )
            );
          }

          if (topParams[p.name]) {
            // name has already been specified
            results.push(
              generateResult(
                uniqueDefinitionMessage(p.name),
                [...meta.path, 'paths', path, 'parameters'],
                rule,
                meta
              )
            );
            continue;
          }
          topParams[p.name] = [...meta.path, 'paths', path, 'parameters'];
        }
      }
    }

    // find parameters set at the operation level
    const operationParams = {};
    for (const op in object.paths[path]) {
      if (!object.paths[path][op]) continue;

      if (op === 'parameters') {
        continue;
      }

      const parameters = object.paths[path][op].parameters;
      if (parameters) {
        // temporary store for tracking parameters specified across operations (to make sure
        // parameters are not defined multiple times under the same operation)
        const tmp = {};

        for (const i in parameters) {
          if (!parameters.hasOwnProperty(i)) continue;

          const p = parameters[i];
          if (p.in && p.in === 'path' && p.name) {
            const parameterPath = ['paths', path, op, 'parameters', i];
            if (!p.required) {
              results.push(
                generateResult(
                  requiredMessage(p.name),
                  [...meta.path, ...parameterPath],
                  rule,
                  meta
                )
              );
            }

            if (tmp[p.name]) {
              results.push(
                generateResult(
                  uniqueDefinitionMessage(p.name),
                  [...meta.path, ...parameterPath],
                  rule,
                  meta
                )
              );
              continue;
            } else if (operationParams[p.name]) {
              continue;
            }

            tmp[p.name] = {};
            operationParams[p.name] = parameterPath;
          }
        }
      }
    }

    // verify templated path elements are present in either top-level or operation parameters
    for (const p in pathElements) {
      if (!pathElements[p]) continue;

      if (!topParams[p] && !operationParams[p]) {
        results.push(
          generateResult(
            `The path "**${path}**" uses a parameter "**{${p}}**" that does not have a corresponding definition.

To fix, add a path parameter with the name "**${p}**".`,
            [...meta.path, 'paths', path],
            rule,
            meta
          )
        );
      }
    }

    // verify parameters defined in either top-level or operation parameters are set in path
    // template
    for (const paramObj of [topParams, operationParams]) {
      for (const p in paramObj) {
        if (!paramObj[p]) continue;

        if (!pathElements[p]) {
          const resPath = paramObj[p];
          results.push(
            generateResult(
              `Parameter "**${p}**" is not used in the path "**${path}**".

Unused parameters are not allowed.

To fix, remove this parameter.`,
              [...meta.path, ...resPath],
              rule,
              meta
            )
          );
        }
      }
    }
  }

  return results;
};

function generateResult(
  message: string,
  path: Array<string | number>,
  rule: Rule,
  _m: IRuleMetadata
): IRuleResult {
  return {
    message,
    path,
    name: _m.name,
    summary: rule.summary,
    severity: _m.rule.severity ? _m.rule.severity : RuleSeverity.ERROR,
    type: rule.type,
  };
}

const requiredMessage = (
  name: string
) => `Path parameter "**${name}**" must have a \`required\` that is set to \`true\`.

To fix, mark this parameter as required.`;

const uniqueDefinitionMessage = (
  name: string
) => `Path parameter '**${name}**' is defined multiple times.

Path parameters must be unique.

To fix, remove the duplicate parameters.`;
