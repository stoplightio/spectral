import { IRuleFunction, IRuleResult, Rule, RuleSeverity } from '../../../../types';

const pathRegex = /(\{[a-zA-Z0-9_-]+\})+/g;

export const oasPathParam: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  /**
   * This rule verifies:
   *
   * 1. for every param defined in the path string ie /users/{userId}, var must be defined in either path.parameters, or operation.parameters object
   * 2. every path.parameters + operation.parameters property must be used in the path string
   */

  for (const path in _object) {
    if (!_object[path]) continue;

    // find all templated path parameters
    const pathElements = {};
    while (true) {
      const match = pathRegex.exec(path);

      if (match && match.length > 0) {
        const p = match[0].replace(/[\{\}]/g, '');
        if (pathElements[p]) {
          results.push({
            path: [...ruleMeta.path, path],
            name: ruleMeta.name,
            summary: _r.summary,
            severity: RuleSeverity.ERROR,
            type: _r.type,
            message: `Templated path parameter ${p} is used multiple times.`,
          });
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
          if (topParams[p.name]) {
            // name has already been specified
            results.push({
              path: [...ruleMeta.path, path, 'parameters'],
              name: ruleMeta.name,
              summary: _r.summary,
              severity: ruleMeta.rule.severity ? ruleMeta.rule.severity : RuleSeverity.ERROR,
              type: _r.type,
              message: `Path parameter name '${p.name}' is used multiple times.`,
            });
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
            if (tmp[p.name]) {
              results.push({
                path: [...ruleMeta.path, path, op],
                name: ruleMeta.name,
                summary: _r.summary,
                severity: ruleMeta.rule.severity ? ruleMeta.rule.severity : RuleSeverity.ERROR,
                type: _r.type,
                message: `Operation parameter name '${p.name}' is used multiple times.`,
              });
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
        results.push({
          path: [...ruleMeta.path, path],
          name: ruleMeta.name,
          summary: _r.summary,
          severity: ruleMeta.rule.severity ? ruleMeta.rule.severity : RuleSeverity.ERROR,
          type: _r.type,
          message: `Templated path parameter '${p}' does not have a corresponding parameter definition.`,
        });
      } else if (topParams[p] && operationParams[p]) {
        results.push({
          path: [...ruleMeta.path, path],
          name: ruleMeta.name,
          summary: _r.summary,
          severity: ruleMeta.rule.severity ? ruleMeta.rule.severity : RuleSeverity.ERROR,
          type: _r.type,
          message: `Templated path parameter '${p}' has multiple definitions`,
        });
      }
    }

    // verify parameters defined in either top-level or operation parameters are set in path
    // template
    for (const paramObj of [topParams, operationParams]) {
      for (const p in paramObj) {
        if (!paramObj[p]) continue;

        if (!pathElements[p]) {
          const resPath = topParams[p];
          results.push({
            path: [...ruleMeta.path, ...resPath],
            name: ruleMeta.name,
            summary: _r.summary,
            severity: ruleMeta.rule.severity ? ruleMeta.rule.severity : RuleSeverity.ERROR,
            type: _r.type,
            message: `Parameter '${p}' does not have a corresponding path parameter template.`,
          });
        }
      }
    }
  }

  return results;
};
