import * as jp from 'jsonpath';

import { lintNode } from './linter';
import { Spectral as CSpectral } from './spectral';
import {
  FunctionCollection,
  IGivenNode,
  IParsedResult,
  IRuleResult,
  IRunOpts,
  IRunRule,
  RunRuleCollection,
} from './types';

export async function runRules(
  parsedResult: IParsedResult,
  rules: RunRuleCollection,
  functions: FunctionCollection,
  opts: IRunOpts,
  Spectral: typeof CSpectral,
): Promise<IRuleResult[]> {
  let results: IRuleResult[] = [];

  for (const name in rules) {
    if (!rules.hasOwnProperty(name)) continue;

    const rule = rules[name];
    if (!rule) continue;

    if (rule.hasOwnProperty('enabled') && !rule.enabled) {
      continue;
    }

    try {
      results = results.concat(await runRule(parsedResult, rule, functions, opts, Spectral));
    } catch (e) {
      console.error(`Unable to run rule '${name}':\n${e}`);
    }
  }

  return results;
}

async function runRule(
  parsedResult: IParsedResult,
  rule: IRunRule,
  functions: FunctionCollection,
  opts: IRunOpts,
  Spectral: typeof CSpectral,
): Promise<IRuleResult[]> {
  const { parsed } = parsedResult;
  const { data: target } = parsed;

  let results: IRuleResult[] = [];
  let nodes: IGivenNode[] = [];

  // don't have to spend time running jsonpath if given is $ - can just use the root object
  if (rule.given && rule.given !== '$') {
    nodes = jp.nodes(target, rule.given);
  } else {
    nodes.push({
      path: ['$'],
      value: target,
    });
  }

  for (const node of nodes) {
    try {
      const thens = Array.isArray(rule.then) ? rule.then : [rule.then];
      for (const then of thens) {
        const func = functions[then.function];
        if (!func) {
          console.warn(`Function ${then.function} not found. Called by rule ${rule.name}.`);
          continue;
        }

        results = results.concat(await lintNode(node, rule, then, func.bind(Spectral), opts, parsedResult));
      }
    } catch (e) {
      console.warn(`Encountered error when running rule '${rule.name}' on node at path '${node.path}':\n${e}`);
    }
  }

  return results;
}
