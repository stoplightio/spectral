const { JSONPath } = require('jsonpath-plus');
import { Optional } from '@stoplight/types';

import { lintNode } from './linter';
import { Resolved } from './resolved';
import { getDiagnosticSeverity } from './rulesets/severity';
import { FunctionCollection, IGivenNode, IRule, IRuleResult, IRunRule, IThen, RunRuleCollection } from './types';
import { hasIntersectingElement } from './utils/';

export const isRuleEnabled = (rule: IRule) => rule.severity !== void 0 && getDiagnosticSeverity(rule.severity) !== -1;

export const runRules = (
  resolved: Resolved,
  rules: RunRuleCollection,
  functions: FunctionCollection,
): IRuleResult[] => {
  const results: IRuleResult[] = [];

  for (const name in rules) {
    if (!rules.hasOwnProperty(name)) continue;

    const rule = rules[name];
    if (!rule) continue;

    if (
      rule.formats !== void 0 &&
      (resolved.formats === null ||
        (resolved.formats !== void 0 && !hasIntersectingElement(rule.formats, resolved.formats)))
    )
      continue;

    if (!isRuleEnabled(rule)) {
      continue;
    }

    try {
      results.push(...runRule(resolved, rule, functions));
    } catch (e) {
      console.error(`Unable to run rule '${name}':\n${e}`);
    }
  }

  return results;
};

const runRule = (resolved: Resolved, rule: IRunRule, functions: FunctionCollection): IRuleResult[] => {
  const target = rule.resolved === false ? resolved.unresolved : resolved.resolved;

  const results: IRuleResult[] = [];

  for (const given of Array.isArray(rule.given) ? rule.given : [rule.given]) {
    // don't have to spend time running jsonpath if given is $ - can just use the root object
    if (given === '$') {
      const validationResults = lint(
        {
          path: ['$'],
          value: target,
        },
        resolved,
        rule,
        functions,
      );

      if (validationResults && validationResults.length > 0) {
        results.push(...validationResults);
      }
    } else {
      JSONPath({
        path: given,
        json: target,
        resultType: 'all',
        callback: (result: any) => {
          const validationResults = lint(
            {
              path: JSONPath.toPathArray(result.path),
              value: result.value,
            },
            resolved,
            rule,
            functions,
          );

          if (validationResults && validationResults.length > 0) {
            results.push(...validationResults);
          }
        },
      });
    }
  }

  return results;
};

function lint(
  node: IGivenNode,
  resolved: Resolved,
  rule: IRunRule,
  functions: FunctionCollection,
): Optional<IRuleResult[]> {
  try {
    if (Array.isArray(rule.then)) {
      const results: IRuleResult[] = [];
      for (const then of rule.then) {
        const validationResults = runThen(node, resolved, rule, then, functions);
        if (validationResults && validationResults.length > 0) {
          results.push(...validationResults);
        }
      }

      return results;
    }

    return runThen(node, resolved, rule, rule.then, functions);
  } catch (e) {
    console.warn(`Encountered error when running rule '${rule.name}' on node at path '${node.path}':\n${e}`);
  }

  return;
}

function runThen(
  node: IGivenNode,
  resolved: Resolved,
  rule: IRunRule,
  then: IThen,
  functions: FunctionCollection,
): Optional<IRuleResult[]> {
  const func = functions[then.function];
  if (!func) {
    console.warn(`Function ${then.function} not found. Called by rule ${rule.name}.`);
    return;
  }

  return lintNode(node, rule, then, func, resolved);
}
