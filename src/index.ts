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
  /**
   * The un-resolved object being parsed
   */
  target: object;

  /**
   * The fully-resolved object being parsed
   */
  resTarget?: object;

  /**
   * A stringified version of the target
   */
  strTarget?: string;

  /**
   * The specification to apply to the target
   */
  spec: string;

  /**
   * Optional ruleset to apply to the target. If not provided, the initialized ruleset will be used
   * instead.
   */
  rulesets?: types.IRuleset[];

  /**
   * Optional rule type, when supplied only rules of this type are run
   */
  type?: types.RuleType;
}

export class Spectral {
  // paths is an internal cache of rules keyed by their path element and format.
  // This is used primarily to ensure that we only issue one JSON path query per
  // unique path.
  private _paths: {
    [path: string]: Set<string>;
  } = {};

  // normalized object for holding rule definitions indexed by name
  private _rules: IRuleStore = {};

  // the initial rule config, set on initialization
  // @ts-ignore
  private _rulesets: types.IRuleset[] = [];

  private _functions: IFunctionStore = {};

  constructor(opts: ISpectralOpts) {
    this.setRules(opts.rulesets);
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

  public setRules(rulesets: types.IRuleset[]) {
    this._rulesets = merge([], rulesets);
    this._functions = this._rulesetsToFunctions(this._rulesets);
    this._rules = this._rulesetsToRules(this._rulesets);
  }

  public run(opts: IRunOpts): types.IRuleResult[] {
    const { target, spec, rulesets = [], type } = opts;
    const results: types.IRuleResult[] = [];

    if (rulesets.length) {
      this.setRules(rulesets);
    }

    if (!target) {
      return results;
    }

    // create a shallow copy of rule configuration for this run
    const runRules: IRuleStore = { ...this._rules };

    for (const path in this._paths) {
      if (!this._paths.hasOwnProperty(path)) continue;

      for (const ruleIndex of this._paths[path]) {
        const { rule, apply, format } = runRules[ruleIndex];

        if (!rule.enabled || (type && rule.type !== type) || format.indexOf(spec) === -1) {
          continue;
        }

        try {
          const nodes = jp.nodes(target, path);

          for (const n of nodes) {
            const { path: nPath, value } = n;

            try {
              const opt: types.IRuleOpts = {
                object: value,
                rule,
                meta: {
                  path: nPath,
                  name: ruleIndex,
                  rule,
                },
              };

              if (path === '$') {
                // allow resolved and stringified targets to be passed to rules when operating on
                // the root path
                if (opts.resTarget) {
                  opt.resObj = opts.resTarget;
                }
                if (opts.strTarget) {
                  opt.strObj = opts.strTarget;
                }
              }

              const result: types.IRuleResult[] = apply(opt);

              results.push(...result);
            } catch (e) {
              console.warn(
                `Encountered error when running rule '${ruleIndex}' on node at path '${nPath}':\n${e}`
              );
            }
          }
        } catch (e) {
          console.error(`Unable to run rule '${ruleIndex}':\n${e}`);
        }
      }
    }

    return results;
  }

  private _parseRuleDefinition(name: string, rule: types.Rule, format: string): IRuleEntry {
    const ruleIndex = this.toRuleIndex(name, format);
    try {
      jp.parse(rule.path);
    } catch (e) {
      throw new SyntaxError(`Invalid JSON path for rule '${ruleIndex}': ${rule.path}\n\n${e}`);
    }

    // update paths object (ensure uniqueness)
    if (!this._paths[rule.path]) {
      this._paths[rule.path] = new Set();
    }

    this._paths[rule.path].add(ruleIndex);

    const ruleFunc = this._functions[rule.function];
    if (!ruleFunc) {
      throw new SyntaxError(`Function does not exist for rule '${ruleIndex}': ${rule.function}`);
    }

    return {
      name,
      format,
      rule: rule as types.Rule,
      apply: ruleFunc,
    };
  }

  private toRuleIndex(ruleName: string, ruleFormat: string) {
    return `${ruleFormat}-${ruleName}`;
  }

  private _rulesetToRules(ruleset: types.IRuleset, internalRuleStore: IRuleStore): IRuleStore {
    const formats = ruleset.rules;
    for (const format in formats) {
      if (!formats.hasOwnProperty(format)) continue;

      for (const ruleName in formats[format]) {
        if (!formats[format].hasOwnProperty(ruleName)) continue;

        const r = formats[format][ruleName];
        const ruleIndex = this.toRuleIndex(ruleName, format);
        if (typeof r === 'boolean') {
          // enabling/disabling rule
          if (!internalRuleStore[ruleIndex]) {
            console.warn(
              `Unable to find rule matching name '${ruleName}' under format ${format} - this entry has no effect`
            );
            continue;
          }

          internalRuleStore[ruleIndex].rule.enabled = r;
        } else if (typeof r === 'object' && !Array.isArray(r)) {
          // rule definition
          internalRuleStore[ruleIndex] = this._parseRuleDefinition(ruleName, r, format);
        } else {
          throw new Error(`Unknown rule definition format: ${r}`);
        }
      }
    }

    return internalRuleStore;
  }

  private _rulesetsToRules(rulesets: types.IRuleset[]): IRuleStore {
    const rules: IRuleStore = merge({}, this._rules);

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
