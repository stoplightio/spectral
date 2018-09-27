import * as types from 'spectral/types';

import * as jp from 'jsonpath';
import { AssertionError } from 'assert';

export class Spectral {
  // paths is an internal cache of rules keyed by their path element and format.
  // This is used primarily to ensure that we only issue one JSON path query per
  // unique path.
  private paths: object = {};

  private rules: types.IRuleConfig;

  constructor() {
    // register the default set of rules
    this.rules = require('../rules/default.json');
    console.log('rules', this.rules);
  }

  // public getRules(format?: string);

  // public getRule(name: string);

  public apply(data: object, format: string, rulesConfig?: types.IRuleConfig): types.IRuleResult[] {
    const results: types.IRuleResult[] = [];

    console.log('apply', format, rulesConfig);
    for (const path in this.paths) {
      for (const ruleName of this.paths[path]) {
        const { rule, apply } = this.rules[ruleName];

        if (!rule.enabled) {
          continue;
        }

        if (rule.path !== path) {
          console.warn(
            `Rule '${
              rule.name
            } was categorized under an incorrect path. Was under ${path}, but rule path is set to ${
              rule.path
            }`
          );
          continue;
        }

        try {
          const nodes = jp.nodes(data, path);
          for (const n of nodes) {
            const { path, value } = n;

            try {
              const result: AssertionError[] = apply(value);
              result.forEach(res => {
                results.push({
                  path,
                  name: ruleName,
                  description: rule.description,
                  category: 'lint',
                  severity: rule.severity,
                  message: rule.description + ' -> ' + res.message,
                });
              });
            } catch (e) {
              console.warn(
                `Encountered error when running rule '${ruleName}' on node at path '${path}':\n${e}`
              );
            }
          }
        } catch (e) {
          console.error(`Unable to run rule '${ruleName}':\n${e}`);
        }
      }
    }

    return results;
  }
}

// const s = new Spectral(config);
// const results = s.apply(data, 'oas2');
// const results = s.apply(data, 'oas2', rulesConfig);
