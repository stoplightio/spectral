import { decodePointerFragment } from '@stoplight/json';
import { get } from 'lodash';
import { getDefaultRange, Resolved } from './resolved';
import { IMessageVars, message } from './rulesets/message';
import { getDiagnosticSeverity } from './rulesets/severity';
import { IFunction, IGivenNode, IRuleResult, IRunRule, IThen } from './types';
import { getClosestJsonPath, printPath, PrintStyle } from './utils';

const { JSONPath } = require('jsonpath-plus');

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

  const results: IRuleResult[] = [];

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

    results.push(
      ...targetResults.map<IRuleResult>(result => {
        const escapedJsonPath = (result.path || targetPath).map(segment => decodePointerFragment(String(segment)));
        const parsed = resolved.getParsedForJsonPath(escapedJsonPath, rule.resolved !== false);
        const path = parsed?.path || getClosestJsonPath(resolved.resolved, escapedJsonPath);
        const doc = parsed?.doc || resolved.parsed;
        const range = doc.getLocationForJsonPath(doc.parsed, path, true)?.range || getDefaultRange();
        const value = path.length === 0 ? parsed?.doc.parsed.data : get(parsed?.doc.parsed.data, path);

        const vars: IMessageVars = {
          property:
            parsed?.missingPropertyPath && parsed.missingPropertyPath.length > path.length
              ? printPath(parsed.missingPropertyPath.slice(path.length - 1), PrintStyle.Dot)
              : path.length > 0
              ? path[path.length - 1]
              : '',
          error: result.message,
          path: printPath(path, PrintStyle.EscapedPointer),
          description: rule.description,
          value,
        };

        const resultMessage = message(result.message, vars);
        vars.error = resultMessage;

        return {
          code: rule.name,
          message: (rule.message === void 0 ? rule.description ?? resultMessage : message(rule.message, vars)).trim(),
          path,
          severity: getDiagnosticSeverity(rule.severity),
          source: parsed?.doc.source,
          range,
        };
      }),
    );
  }

  return results;
};
