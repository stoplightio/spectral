import { IRuleFunction, IRuleMetadata, IRuleResult, Rule, RuleSeverity } from '../../../../types';

const pathRegex = /(\{[a-zA-Z0-9_-]+\})+/g;

export const oasPathParam: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  /**
   * This rule verifies:
   *
   * 1. for every param defined in the path string ie /users/{userId}, var must be defined in either
   *    path.parameters, or operation.parameters object
   * 2. every path.parameters + operation.parameters property must be used in the path string
   */

  // keep track of normalized paths for verifying paths are unique
  const uniquePaths: object = {};

  for (const path in _object) {
    if (!_object[path]) continue;

    // verify normalized paths are functionally unique (ie `/path/{one}` vs `/path/{two}` are
    // different but equivalent within the context of OAS)
    const normalized = path.replace(pathRegex, '%'); // '%' is used here since its invalid in paths
    if (uniquePaths[normalized]) {
      results.push(
        generateResult(
          `Paths ${uniquePaths[normalized]} and ${path} are functionally equivalent`,
          [...ruleMeta.path],
          _r,
          ruleMeta
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
              `Templated path parameter ${p} is used multiple times.`,
              [...ruleMeta.path, path],
              _r,
              ruleMeta
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
    if (_object[path].parameters) {
      for (const p of _object[path].parameters) {
        if (p.in && p.in === 'path' && p.name) {
          if (!p.required) {
            results.push(
              generateResult(
                `Path parameter ${p.name} must have \`required\` set to \`true\``,
                [...ruleMeta.path, path, 'parameters'],
                _r,
                ruleMeta
              )
            );
          }

          if (topParams[p.name]) {
            // name has already been specified
            results.push(
              generateResult(
                `Path parameter name '${p.name}' is used multiple times.`,
                [...ruleMeta.path, path, 'parameters'],
                _r,
                ruleMeta
              )
            );
            continue;
          }
          topParams[p.name] = [path, 'parameters'];
        }
      }
    }

    // find parameters set at the operation level
    const operationParams = {};
    for (const op in _object[path]) {
      if (!_object[path][op]) continue;

      if (op === 'parameters') {
        continue;
      }
      if (_object[path][op].parameters) {
        // temporary store for tracking parameters specified across operations (to make sure
        // parameters are not defined multiple times under the same operation)
        const tmp = {};

        for (const p of _object[path][op].parameters) {
          if (p.in && p.in === 'path' && p.name) {
            if (!p.required) {
              results.push(
                generateResult(
                  `Path parameter ${p.name} must have \`required\` set to \`true\``,
                  [...ruleMeta.path, path, op, 'parameters'],
                  _r,
                  ruleMeta
                )
              );
            }

            if (tmp[p.name]) {
              results.push(
                generateResult(
                  `Operation parameter name '${p.name}' is used multiple times.`,
                  [...ruleMeta.path, path, op, 'parameters'],
                  _r,
                  ruleMeta
                )
              );
              continue;
            } else if (operationParams[p.name]) {
              continue;
            }
            tmp[p.name] = {};
            operationParams[p.name] = [path, op];
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
            `Templated path parameter '${p}' does not have a corresponding parameter definition.`,
            [...ruleMeta.path, path],
            _r,
            ruleMeta
          )
        );
      } else if (topParams[p] && operationParams[p]) {
        results.push(
          generateResult(
            `Templated path parameter '${p}' has multiple definitions`,
            [...ruleMeta.path, path],
            _r,
            ruleMeta
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
          const resPath = topParams[p];
          results.push(
            generateResult(
              `Parameter '${p}' does not have a corresponding path parameter template.`,
              [...ruleMeta.path, ...resPath],
              _r,
              ruleMeta
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
  _r: Rule,
  _m: IRuleMetadata
): IRuleResult {
  return {
    message,
    path,
    name: _m.name,
    summary: _r.summary,
    severity: _m.rule.severity ? _m.rule.severity : RuleSeverity.ERROR,
    type: _r.type,
  };
}
