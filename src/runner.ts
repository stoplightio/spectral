import * as jp from 'jsonpath';

import { lintNode } from './linter';
import { FunctionCollection, IRuleResult, IRunOpts, IRunResult, IRunRule, RunRuleCollection } from './types';

export const runRules = (
  target: object,
  rules: RunRuleCollection,
  functions: FunctionCollection,
  opts: IRunOpts
): IRunResult => {
  let results: IRuleResult[] = [];

  for (const name in rules) {
    const rule = rules[name];
    if (!rule) continue;

    if (rule.hasOwnProperty('enabled') && !rule.enabled) {
      continue;
    }

    try {
      results = results.concat(runRule(target, rule, functions, opts));
    } catch (e) {
      console.error(`Unable to run rule '${name}':\n${e}`);
    }
  }

  return { results };
};

const runRule = (target: object, rule: IRunRule, functions: FunctionCollection, opts: IRunOpts): IRuleResult[] => {
  let results: IRuleResult[] = [];

  const nodes = jp.nodes(target, rule.given);

  for (const node of nodes) {
    try {
      const thens = Array.isArray(rule.then) ? rule.then : [rule.then];
      for (const then of thens) {
        const func = functions[then.function];
        if (!func) {
          console.warn(`Function ${then.function} not found. Called by rule ${rule.name}.`);
          continue;
        }

        results = results.concat(lintNode(node, rule, then, func, opts));
      }
    } catch (e) {
      console.warn(`Encountered error when running rule '${rule.name}' on node at path '${node.path}':\n${e}`);
    }
  }

  return results;
};
