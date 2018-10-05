const merge = require('lodash.merge');
import * as jp from 'jsonpath';

import { functions } from './functions';
import * as types from './types';

interface IFunctionStore {
  [name: string]: types.IRuleFunction;
}

interface IRuleStore {
  [index: string]: IRuleEntry;
}

interface IRuleEntry {
  name: string;
  format: string;
  rule: types.Rule;
  apply: types.IRuleFunction;
}

interface ISpectralOpts {
  rulesets: types.IRuleset[];
}

interface IRunOpts {
  target: object;
  spec: string;
  rulesets?: types.IRuleset[];
  type?: types.RuleType;
}

export class Spectral {
  // paths is an internal cache of rules keyed by their path element and format.
  // This is used primarily to ensure that we only issue one JSON path query per
  // unique path.
  private _paths: object = {};

  // normalized object for holding rule definitions indexed by name
  private _rules: IRuleStore = {};

  // the initial rule config, set on initialization
  private readonly _rulesets: types.IRuleset[];

  private readonly _functions: IFunctionStore;

  constructor(opts: ISpectralOpts) {
    this._rulesets = opts.rulesets;
    this._functions = this._rulesetsToFunctions(this._rulesets);
    this._rules = this._rulesetsToRules(this._rulesets);
  }

  // TODO needs better pattern matching
  public getRules(dataFormat?: string): IRuleEntry[] {
    const rules = [];

    for (const name in this._rules) {
      if (!this._rules.hasOwnProperty(name)) continue;
      const { rule, format, apply } = this._rules[name];

      if (!dataFormat || format.indexOf(dataFormat) !== -1) {
        rules.push({ name, format, rule, apply });
      }
    }

    return rules;
  }

  public run({ target, spec, rulesets = [], type }: IRunOpts): types.IRuleResult[] {
    const results: types.IRuleResult[] = [];

    let runRules: IRuleStore;
    if (rulesets.length) {
      runRules = this._rulesetsToRules(rulesets);
    } else {
      // create a shallow copy of rule configuration for this run
      runRules = { ...this._rules };
    }

    for (const path in this._paths) {
      if (!this._paths.hasOwnProperty(path)) continue;

      for (const ruleName of this._paths[path]) {
        const { rule, apply, format } = runRules[ruleName];

        if (!rule.enabled || (type && rule.type !== type) || format.indexOf(spec) === -1) {
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
          const nodes = jp.nodes(target, path);

          for (const n of nodes) {
            const { path: nPath, value } = n;

            try {
              const result: types.IRuleResult[] = apply(value, rule, {
                path: nPath,
                name: ruleName,
                rule,
              });

              results.push(...result);
            } catch (e) {
              console.warn(
                `Encountered error when running rule '${ruleName}' on node at path '${nPath}':\n${e}`
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

  private _parseRuleDefinition(name: string, rule: types.Rule, format: string): IRuleEntry {
    try {
      jp.parse(rule.path);
    } catch (e) {
      throw new SyntaxError(`Invalid JSON path for rule '${name}': ${rule.path}\n\n${e}`);
    }

    // update paths object (ensure uniqueness)
    if (!this._paths[rule.path]) {
      this._paths[rule.path] = [];
    }

    let present = false;
    for (const ruleName of this._paths[rule.path]) {
      if (ruleName === name) {
        present = true;
        break;
      }
    }

    if (!present) {
      this._paths[rule.path].push(name);
    }

    const ruleFunc = this._functions[rule.function];
    if (!ruleFunc) {
      throw new SyntaxError(`Function does not exist for rule '${name}': ${rule.function}`);
    }

    return {
      name,
      format,
      rule: rule as types.Rule,
      apply: ruleFunc,
    };
  }

  private _rulesetToRules(ruleset: types.IRuleset, rules: IRuleStore): IRuleStore {
    const formats = ruleset.rules;
    for (const format in formats) {
      if (!formats.hasOwnProperty(format)) continue;

      for (const ruleName in formats[format]) {
        if (!formats[format].hasOwnProperty(ruleName)) continue;

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
          rules[ruleName] = this._parseRuleDefinition(ruleName, r, format);
        } else {
          throw new Error(`Unknown rule definition format: ${r}`);
        }
      }
    }

    return rules;
  }

  private _rulesetsToRules(rulesets: types.IRuleset[]): IRuleStore {
    const rules: IRuleStore = { ...this._rules };

    for (const ruleset of rulesets) {
      merge(rules, this._rulesetToRules(ruleset, rules));
    }

    return rules;
  }

  private _rulesetsToFunctions(rulesets: types.IRuleset[]): IFunctionStore {
    let funcs = { ...functions };

    for (const ruleset of rulesets) {
      if (ruleset.functions) {
        funcs = { ...funcs, ...ruleset.functions };
      }
    }

    return funcs;
  }
}
