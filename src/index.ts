import * as types from '@spectral/types';
import { generateRule } from '@spectral/rules';

import * as jp from 'jsonpath';
import { AssertionError } from 'assert';

export class Spectral {
  // paths is an internal cache of rules keyed by their path element and format.
  // This is used primarily to ensure that we only issue one JSON path query per
  // unique path.
  private paths: object = {};
  // normalized object for holding rule definitions indexed by name
  private rules: object = {};

  private ruleConfig: types.IRuleConfig;

  constructor(rules?: types.IRuleConfig) {
    if (rules) {
      // rules configuration provided, use it
      this.ruleConfig = rules;
    } else {
      // no rules configuration provided, fall back to the default
      this.ruleConfig = require('@spectral/rules/default.json');
    }
    this.parseRuleConfig(this.ruleConfig);
  }

  private parseRuleDefinition(name: string, rule: types.IRuleDefinitionBase) {
    try {
      jp.parse(rule.path);
    } catch (e) {
      throw new SyntaxError(`Invalid JSON path for rule '${name}': ${rule.path}\n\n${e}`);
    }

    // const rule = {
    //   name,
    //   ...ruleDef,
    // };
    // update rules object
    this.rules[name] = {
      rule: rule,
      apply: generateRule(rule as types.LintRule),
    };

    // update paths object (ensure uniqueness)
    if (!this.paths[rule.path]) {
      this.paths[rule.path] = [];
    }
    let present = false;
    for (const ruleName of this.paths[rule.path]) {
      if (ruleName === name) {
        present = true;
        break;
      }
    }
    if (!present) {
      this.paths[rule.path].push(name);
    }
  }

  private parseRuleConfig(ruleConfig: types.IRuleConfig) {
    const formats = ruleConfig.rules;
    for (const format in formats) {
      for (const ruleName in formats[format]) {
        const r = formats[format][ruleName];
        if (typeof r === 'boolean') {
          // enabling/disabling rule
          const rule = this.rules[ruleName];
          if (!rule) {
            console.warn(
              `Unable to find rule matching name '${ruleName}' under format ${format} - this entry has no effect`
            );
            continue;
          }
          rule.enabled = r;
        } else if (typeof r === 'object' && !Array.isArray(r)) {
          // rule definition
          this.parseRuleDefinition(ruleName, r);
        } else {
          throw new Error(`Unknown rule definition format: ${r}`);
        }
      }
    }
  }

  // public getRules(format?: string);

  // public getRule(name: string);

  public apply(data: object, format: string, rulesConfig?: types.IRuleConfig): types.IRuleResult[] {
    const results: types.IRuleResult[] = [];

    if (!rulesConfig) {
      // no rules configuration was provided, use the rules provided at
      // initialization time
    } else {
      // rules configuration was provided
    }

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
