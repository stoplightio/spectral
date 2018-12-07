const merge = require('lodash/merge');
const values = require('lodash/values');
import * as jp from 'jsonpath';

import { PathComponent } from 'jsonpath';
import { compact, flatten } from 'lodash';
import { functions as defaultFunctions } from './functions';
import * as types from './types';
import {
  IFunctionStore,
  IParsedRulesetResult,
  IRuleEntry,
  IRuleStore,
  IRunOpts,
  ISpectralOpts,
} from './types/spectral';

export class Spectral {
  // normalized object for holding rule definitions indexed by ${format}-${name}
  private _rulesByIndex: IRuleStore = {};

  // the initial rule config, set on initialization
  // @ts-ignore
  private _rulesets: types.IRuleset[] = [];

  private _functions: IFunctionStore = defaultFunctions;

  constructor(opts: ISpectralOpts) {
    this.setRules(opts.rulesets);
  }

  // TODO needs better pattern matching
  public getRules(dataFormat?: string): IRuleEntry[] {
    const rules = [];

    for (const name in this._rulesByIndex) {
      if (!this._rulesByIndex.hasOwnProperty(name)) continue;
      const { name: rName, rule, format, apply } = this._rulesByIndex[name];

      if (!dataFormat || format === dataFormat) {
        rules.push({ name: rName, format, rule, apply });
      }
    }

    return rules;
  }

  public setRules(rulesets: types.IRuleset[]) {
    const { rulesets: rSets, functionStore, ruleStore } = this._parseRuleSets(rulesets, {
      includeCurrent: false,
    });

    this._rulesets = rSets;
    this._functions = functionStore;
    this._rulesByIndex = ruleStore;
  }

  public updateRules(rulesets: types.IRuleset[]) {
    const { rulesets: rSets, functionStore, ruleStore } = this._parseRuleSets(rulesets, {
      includeCurrent: true,
    });

    this._rulesets = rSets;
    this._functions = functionStore;
    this._rulesByIndex = ruleStore;
  }

  public run(opts: IRunOpts): types.IRuleResult[] {
    const { target, rulesets = [] } = opts;

    const ruleStore = rulesets.length
      ? this._parseRuleSets(rulesets, { includeCurrent: true }).ruleStore
      : this._rulesByIndex;

    return target ? this.runAllLinters(ruleStore, opts) : [];
  }

  private runAllLinters(ruleStore: IRuleStore, opts: IRunOpts): types.IRuleResult[] {
    return flatten(
      compact(
        values(ruleStore).map((ruleEntry: IRuleEntry) => {
          if (
            !ruleEntry.rule.enabled ||
            (opts.type && ruleEntry.rule.type !== opts.type) ||
            ruleEntry.format !== opts.spec
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
            console.warn(`Encountered error when running rule '${ruleEntry.name}' on node at path '${nPath}':\n${e}`);
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

  private _parseRuleSets(
    rulesets: types.IRuleset[],
    { includeCurrent }: { includeCurrent: boolean }
  ): IParsedRulesetResult {
    const rSets = merge([], rulesets);

    let functionStore = includeCurrent ? this._functions : defaultFunctions;
    let ruleStore = includeCurrent ? this._rulesByIndex : {};

    if (rSets.length) {
      functionStore = { ...functionStore, ...this._rulesetsToFunctions(rulesets) };
      ruleStore = this._rulesetsToRules(rulesets, ruleStore, functionStore);
    }

    return {
      rulesets: rSets,
      functionStore,
      ruleStore,
    };
  }

  private _parseRuleDefinition(
    { name, format, rule }: { name: string; format: string; rule: types.Rule },
    functionStore: IFunctionStore = {}
  ): IRuleEntry {
    const ruleIndex = this.toRuleIndex(name, format);
    try {
      jp.parse(rule.path);
    } catch (e) {
      throw new SyntaxError(`Invalid JSON path for rule '${ruleIndex}': ${rule.path}\n\n${e}`);
    }

    const ruleFunc = functionStore[rule.function] || this._functions[rule.function];
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

  private _rulesetToRules(
    ruleset: types.IRuleset,
    internalRuleStore: IRuleStore,
    functionStore?: IFunctionStore
  ): IRuleStore {
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
          internalRuleStore[ruleIndex] = this._parseRuleDefinition({ name: ruleName, rule: r, format }, functionStore);
        } else {
          throw new Error(`Unknown rule definition format: ${r}`);
        }
      }
    }

    return internalRuleStore;
  }

  private _rulesetsToRules(
    rulesets: types.IRuleset[],
    ruleStore?: IRuleStore,
    functionStore?: IFunctionStore
  ): IRuleStore {
    const rules: IRuleStore = merge({}, ruleStore);

    for (const ruleset of rulesets) {
      merge(rules, this._rulesetToRules(ruleset, rules, functionStore));
    }

    return rules;
  }

  private _rulesetsToFunctions(rulesets: types.IRuleset[]): IFunctionStore {
    let funcs = {};

    for (const ruleset of rulesets) {
      if (ruleset.functions) {
        funcs = { ...funcs, ...ruleset.functions };
      }
    }

    return funcs;
  }
}
