const merge = require('lodash/merge');
const values = require('lodash/values');
import * as jp from 'jsonpath';

import { PathComponent } from 'jsonpath';
import { compact, flatten } from 'lodash';
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
  // normalized object for holding rule definitions indexed by name
  private _rulesByIndex: IRuleStore = {};

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

    for (const name in this._rulesByIndex) {
      if (!this._rulesByIndex.hasOwnProperty(name)) continue;
      const { rule, format, apply } = this._rulesByIndex[name];

      if (!dataFormat || format.indexOf(dataFormat) !== -1) {
        rules.push({ name, format, rule, apply });
      }
    }

    return rules;
  }

  public setRules(rulesets: types.IRuleset[]) {
    this._rulesets = merge([], rulesets);
    this._functions = this._rulesetsToFunctions(this._rulesets);
    this._rulesByIndex = this._rulesetsToRules(this._rulesets);
  }

  public run(opts: IRunOpts): types.IRuleResult[] {
    const { target, rulesets = [] } = opts;

    if (rulesets.length) {
      this.setRules(rulesets);
    }

    return target ? this.runAllLinters(opts) : [];
  }

  private runAllLinters(opts: IRunOpts): types.IRuleResult[] {
    return flatten(
      compact(
        values(this._rulesByIndex).map((ruleEntry: IRuleEntry) => {
          if (
            !ruleEntry.rule.enabled ||
            (opts.type && ruleEntry.rule.type !== opts.type) ||
            ruleEntry.format.indexOf(opts.spec) === -1
          ) {
            return null;
          }

          try {
            return this.lintNodes(ruleEntry, opts);
          } catch (e) {
            console.error(`Unable to run rule '${ruleEntry.name}':\n${e}`);
            return null;
          }
        })
      )
    );
  }

  private lintNodes(ruleEntry: IRuleEntry, opts: IRunOpts): types.IRuleResult[] {
    const nodes = jp.nodes(opts.target, ruleEntry.rule.path);
    return flatten(
      compact(
        nodes.map(node => {
          const { path: nPath } = node;
          try {
            return this.lintNode(ruleEntry, opts, node);
          } catch (e) {
            console.warn(
              `Encountered error when running rule '${
                ruleEntry.name
              }' on node at path '${nPath}':\n${e}`
            );
            return null;
          }
        })
      )
    );
  }

  private lintNode(
    ruleEntry: IRuleEntry,
    opts: IRunOpts,
    node: { path: PathComponent[]; value: any }
  ): types.IRuleResult[] {
    const opt: types.IRuleOpts = {
      object: node.value,
      rule: ruleEntry.rule,
      meta: {
        path: node.path,
        name: ruleEntry.name,
        rule: ruleEntry.rule,
      },
    };

    if (ruleEntry.rule.path === '$') {
      // allow resolved and stringified targets to be passed to rules when operating on
      // the root path
      if (opts.resTarget) {
        opt.resObj = opts.resTarget;
      }
      if (opts.strTarget) {
        opt.strObj = opts.strTarget;
      }
    }

    return ruleEntry.apply(opt);
  }

  private _parseRuleDefinition(name: string, rule: types.Rule, format: string): IRuleEntry {
    const ruleIndex = this.toRuleIndex(name, format);
    try {
      jp.parse(rule.path);
    } catch (e) {
      throw new SyntaxError(`Invalid JSON path for rule '${ruleIndex}': ${rule.path}\n\n${e}`);
    }

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
    const rules: IRuleStore = merge({}, this._rulesByIndex);

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
