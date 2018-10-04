import * as types from './types';
import { generateRule } from './rules';

import * as rc from './rules/default.json';

// TODO: figure out why rc cannot be used without the any typing
const ruleConfig: any = rc;

import * as jp from 'jsonpath';

interface IRuleStore {
  [index: string]: IRuleEntry;
}

interface IRuleEntry {
  format: string;
  rule: types.Rule;
  apply: (object: any, rule: types.Rule, meta: types.IRuleMetadata) => types.IRuleResult[];
}

export class Spectral {
  // paths is an internal cache of rules keyed by their path element and format.
  // This is used primarily to ensure that we only issue one JSON path query per
  // unique path.
  private paths: object = {};
  // normalized object for holding rule definitions indexed by name
  private rules: IRuleStore = {};
  // the initial rule config, set on initialization
  private readonly ruleConfig: types.IRuleConfig;

  constructor(rules?: types.IRuleConfig) {
    if (rules) {
      // rules configuration provided, use it
      this.ruleConfig = rules;
    } else {
      // no rules configuration provided, fall back to the default
      this.ruleConfig = ruleConfig;
    }
    this.rules = this.parseRuleConfig(this.ruleConfig);
  }

  private parseRuleDefinition(
    name: string,
    rule: types.IRuleDefinitionBase,
    format: string
  ): IRuleEntry {
    try {
      jp.parse(rule.path);
    } catch (e) {
      throw new SyntaxError(`Invalid JSON path for rule '${name}': ${rule.path}\n\n${e}`);
    }

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

    return {
      format,
      rule: rule as types.Rule,
      apply: generateRule(rule as types.Rule),
    };
  }

  private parseRuleConfig(ruleConfig: types.IRuleConfig): IRuleStore {
    const rules: IRuleStore = { ...this.rules };

    const formats = ruleConfig.rules;
    for (const format in formats) {
      for (const ruleName in formats[format]) {
        const r = formats[format][ruleName];
        if (typeof r === 'boolean') {
          // enabling/disabling rule
          if (!rules[ruleName]) {
            console.warn(
              `Unable to find rule matching name '${ruleName}' under format ${format} - this entry has no effect`
            );
            continue;
          }
          rules[ruleName].rule.enabled = r;
        } else if (typeof r === 'object' && !Array.isArray(r)) {
          // rule definition
          rules[ruleName] = this.parseRuleDefinition(ruleName, r, format);
        } else {
          throw new Error(`Unknown rule definition format: ${r}`);
        }
      }
    }

    return rules;
  }

  // TODO needs better pattern matching
  public getRules(dataFormat: string = ''): any[] {
    const rules = [];

    for (const name in this.rules) {
      const { rule, format } = this.rules[name];

      if (format.indexOf(dataFormat) !== -1) {
        rules.push({ name, format, ...rule });
      }
    }

    return rules;
  }

  // public getRule(name: string);

  public apply(
    data: object,
    dataFormat: string,
    rulesConfig?: types.IRuleConfig
  ): types.IRuleResult[] {
    const results: types.IRuleResult[] = [];

    // create copy of rule configuration for this run
    let runRules: IRuleStore;
    if (rulesConfig) {
      runRules = this.parseRuleConfig(rulesConfig);
    } else {
      runRules = { ...this.rules };
    }

    for (const path in this.paths) {
      for (const ruleName of this.paths[path]) {
        const { rule, apply, format } = runRules[ruleName];

        if (!rule.enabled || format.indexOf(dataFormat) === -1) {
          continue;
        }

        if (ruleName) {
          if (rule.path !== path) {
            console.warn(
              `Rule '${ruleName} was categorized under an incorrect path. Was under ${path}, but rule path is set to ${
                rule.path
              }`
            );
            continue;
          }
        }

        try {
          const nodes = jp.nodes(data, path);
          for (const n of nodes) {
            const { path, value } = n;

            try {
              const result: types.IRuleResult[] = apply(value, rule, {
                path,
                name: ruleName,
                rule,
              });
              results.push(...result);
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
