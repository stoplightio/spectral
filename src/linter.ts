import { JsonPath } from '@stoplight/types';
import { get, has } from 'lodash';

const { JSONPath } = require('jsonpath-plus');

import { decodePointerFragment, pathToPointer } from '@stoplight/json';
import { Resolved } from './resolved';
import { message } from './rulesets/message';
import { getDiagnosticSeverity } from './rulesets/severity';
import { IFunction, IGivenNode, IRuleResult, IRunRule, IThen } from './types';
import { isObject } from './utils';

// TODO(SO-23): unit test but mock whatShouldBeLinted
export const lintNode = (
  node: IGivenNode,
  rule: IRunRule,
  then: IThen<string, any>,
  apply: IFunction,
  resolved: Resolved,
): IRuleResult[] => {
  const givenPath = node.path[0] === '$' ? node.path.slice(1) : node.path;
  const targetValue = node.value;

  const targets: any[] = [];
  if (then && then.field) {
    if (then.field === '@key') {
      for (const key of Object.keys(targetValue)) {
        targets.push({
          path: key,
          value: key,
        });
      }
    } else if (then.field[0] === '$') {
      try {
        JSONPath({
          path: then.field,
          json: targetValue,
          resultType: 'all',
          callback: (result: any) => {
            targets.push({
              path: JSONPath.toPathArray(result.path),
              value: result.value,
            });
          },
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      // lodash lookup
      targets.push({
        path: typeof then.field === 'string' ? then.field.split('.') : then.field,
        value: get(targetValue, then.field),
      });
    }
  } else {
    targets.push({
      path: [],
      value: targetValue,
    });
  }

  if (!targets.length) {
    // must call then at least once, with no resolved
    targets.push({
      path: [],
      value: undefined,
    });
  }

  let results: IRuleResult[] = [];

  for (const target of targets) {
    const targetPath = givenPath.concat(target.path);

    const targetResults =
      apply(
        target.value,
        then.functionOptions || {},
        {
          given: givenPath,
          target: targetPath,
        },
        {
          original: node.value,
          given: node.value,
          resolved,
        },
      ) || [];

    results = results.concat(
      targetResults.map<IRuleResult>(result => {
        const escapedJsonPath = (result.path || targetPath).map(segment => decodePointerFragment(String(segment)));
        const path = getClosestJsonPath(
          rule.resolved === false ? resolved.unresolved : resolved.resolved,
          escapedJsonPath,
        );
        // todo: https://github.com/stoplightio/spectral/issues/608
        const location = resolved.getLocationForJsonPath(path, true);

        return {
          code: rule.name,

          message:
            rule.message === undefined
              ? rule.description || result.message
              : message(rule.message, {
                  error: result.message,
                  property: path.length > 0 ? path[path.length - 1] : '',
                  path: pathToPointer(path),
                  description: rule.description,
                  get value() {
                    // let's make it `value` lazy
                    const value = resolved.getValueForJsonPath(path);
                    if (isObject(value)) {
                      return Array.isArray(value) ? 'Array[]' : 'Object{}';
                    }

                    return JSON.stringify(value);
                  },
                }),
          path,
          severity: getDiagnosticSeverity(rule.severity),
          source: location.uri,
          range: location.range,
        };
      }),
    );
  }

  return results;
};

// todo: revisit -> https://github.com/stoplightio/spectral/issues/608
function getClosestJsonPath(data: unknown, path: JsonPath) {
  if (!isObject(data)) return [];

  while (path.length > 0 && !has(data, path)) {
    path.pop();
  }

  return path;
}
