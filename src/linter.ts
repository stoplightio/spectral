import { DiagnosticSeverity, JsonPath } from '@stoplight/types';
import * as jp from 'jsonpath';
import get = require('lodash/get');
import has = require('lodash/has');

import { IFunction, IGivenNode, IParsedResult, IRuleResult, IRunOpts, IRunRule, IThen } from './types';

// TODO(SO-23): unit test but mock whatShouldBeLinted
export const lintNode = (
  node: IGivenNode,
  rule: IRunRule,
  then: IThen<string, any>,
  apply: IFunction,
  opts: IRunOpts,
  parsedResult: IParsedResult
): IRuleResult[] => {
  const givenPath = node.path[0] === '$' ? node.path.slice(1) : node.path;
  const conditioning = whatShouldBeLinted(givenPath, node.value, rule);

  // If the 'when' condition is not satisfied, simply don't run the linter
  if (!conditioning.lint) {
    return [];
  }

  const { parsed } = parsedResult;
  const targetValue = conditioning.value;

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
      // jsonpath lookup
      const nodes = jp.nodes(targetValue, then.field);
      for (const n of nodes) {
        targets.push({
          path: n.path,
          value: n.value,
        });
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
    // must call then at least once, with no result
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
          resolved: opts.resolvedTarget,
        }
      ) || [];

    const severity = rule.severity !== undefined ? rule.severity : DiagnosticSeverity.Warning;

    results = results.concat(
      targetResults.map(result => {
        const location = parsedResult.getLocationForJsonPath(parsed, result.path || targetPath);

        return {
          code: rule.name,
          summary: rule.summary,
          message: result.message,
          path: result.path || targetPath,
          severity,
          source: parsedResult.source,
          ...(location || {
            range: {
              start: {
                character: 0,
                line: 0,
              },
              end: {
                character: 0,
                line: 0,
              },
            },
          }),
        };
      })
    );
  }

  return results;
};

// TODO(SO-23): unit test idividually
export const whatShouldBeLinted = (
  path: JsonPath,
  originalValue: any,
  rule: IRunRule
): { lint: boolean; value: any } => {
  const leaf = path[path.length - 1];

  const when = rule.when;
  if (!when) {
    return {
      lint: true,
      value: originalValue,
    };
  }

  const pattern = when.pattern;
  const field = when.field;

  // TODO: what if someone's field is called '@key'? should we use @@key?
  const isKey = field === '@key';

  if (!pattern) {
    // isKey doesn't make sense without pattern
    if (isKey) {
      return {
        lint: false,
        value: originalValue,
      };
    }

    return {
      lint: has(originalValue, field),
      value: originalValue,
    };
  }

  if (isKey && pattern) {
    return keyAndOptionalPattern(leaf, pattern, originalValue);
  }

  const fieldValue = String(get(originalValue, when.field));

  return {
    lint: fieldValue.match(pattern) !== null,
    value: originalValue,
  };
};

function keyAndOptionalPattern(key: string | number, pattern: string, value: any) {
  /** arrays, look at the keys on the array object. note, this number check on id prop is not foolproof... */
  if (typeof key === 'number' && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      if (String(k).match(pattern)) {
        return {
          lint: true,
          value,
        };
      }
    }
  } else if (String(key).match(pattern)) {
    // objects
    return {
      lint: true,
      value,
    };
  }

  return {
    lint: false,
    value,
  };
}
