const merge = require('lodash/merge');
const values = require('lodash/values');
import * as jp from 'jsonpath';

import { PathComponent } from 'jsonpath';
import { compact, flatten } from 'lodash';
import { functions as defaultFunctions } from './functions';
import * as types from './types';
import {
  IFunctionCollection,
  IParsedRulesetResult,
  IRuleCollection,
  IRuleEntry,
  IRunOpts,
  IRunResult,
  ISpectralOpts,
} from './types/spectral';

export class Spectral {
  // normalized object for holding rule definitions indexed by ${format}-${name}
  private _rulesByIndex: IRuleCollection = {};

  // the initial rule config, set on initialization
  // @ts-ignore
  private _rulesets: types.IRuleset[] = [];

  private _functionCollection: IFunctionCollection = defaultFunctions;

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

  // // should be set rules imo
  // public addRules(rules: IRuleCollection) {
  //   this._rulesByIndex = this.parseRules(rules);
  // }

  public newSetFunctions(functionCollection: IFunctionCollection) {
    this._functionCollection = this.parseFunctionCollection(functionCollection, false);
  }

  public newUpdateFunctions(functionCollection: IFunctionCollection) {
    this._functionCollection = this.parseFunctionCollection(functionCollection, true);
  }

  public newSetRules(rules: IRuleCollection) {
    return this.parseRuleCollection(rules, false);
  }

  public newUpdateRules(rules: IRuleCollection) {
    return this.parseRuleCollection(rules, true);
  }

  private parseRuleCollection(ruleCollection: IRuleCollection, includeCurrent: boolean) {
    const currentRules = includeCurrent ? merge({}, this._rulesByIndex) : {};
    return this.toRules(ruleCollection, currentRules, this._functionCollection);
  }

  private toRules(
    ruleCollection: IRuleCollection,
    internalRuleStore: IRuleCollection,
    functionStore?: IFunctionCollection
  ): IRuleCollection {
    for (const format in ruleCollection) {
      if (!ruleCollection.hasOwnProperty(format)) continue;

      for (const ruleName in ruleCollection[format]) {
        if (!ruleCollection[format].hasOwnProperty(ruleName)) continue;

        const r = ruleCollection[format][ruleName];
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
          internalRuleStore[ruleIndex] = this.parseRuleDefinition({ name: ruleName, rule: r, format }, functionStore);
        } else {
          throw new Error(`Unknown rule definition format: ${r}`);
        }
      }
    }

    return internalRuleStore;
  }

  public setRules(rulesets: types.IRuleset[]) {
    const { rulesets: rSets, functionCollection, ruleCollection } = this.parseRuleSets(rulesets, {
      includeCurrent: false,
    });

    this._rulesets = rSets;
    this._functionCollection = functionCollection;
    this._rulesByIndex = ruleCollection;
  }

  public updateRules(rulesets: types.IRuleset[]) {
    const { rulesets: rSets, functionCollection, ruleCollection } = this.parseRuleSets(rulesets, {
      includeCurrent: true,
    });

    this._rulesets = rSets;
    this._functionCollection = functionCollection;
    this._rulesByIndex = ruleCollection;
  }

  public run(target: object, opts: IRunOpts): IRunResult {
    return {
      results: this.runAllLinters(target, this._rulesByIndex, opts),
    };
  }

  private runAllLinters(target: object, ruleStore: IRuleCollection, opts: IRunOpts): types.IRuleResult[] {
    return flatten(
      compact(
        values(ruleStore).map((ruleEntry: IRuleEntry) => {
          if (
            !ruleEntry.rule.enabled ||
            (opts.type && ruleEntry.rule.type !== opts.type) ||
            ruleEntry.format !== opts.format
          ) {
            return null;
          }

          try {
            return this.lintNodes(target, ruleEntry, opts);
          } catch (e) {
            console.error(`Unable to run rule '${ruleEntry.name}':\n${e}`);
            return null;
          }
        })
      )
    );
  }

  private lintNodes(target: object, ruleEntry: IRuleEntry, opts: IRunOpts): types.IRuleResult[] {
    const nodes = jp.nodes(target, ruleEntry.rule.path);
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
      if (opts.resolvedTarget) {
        opt.resObj = opts.resolvedTarget;
      }
    }

    return ruleEntry.apply(opt);
  }

  private parseRuleSets(
    rulesets: types.IRuleset[],
    { includeCurrent }: { includeCurrent: boolean }
  ): IParsedRulesetResult {
    const rSets = merge([], rulesets);

    let functionStore = includeCurrent ? this._functionCollection : defaultFunctions;
    let rulesCollection = includeCurrent ? this._rulesByIndex : {};

    if (rSets.length) {
      functionStore = { ...functionStore, ...this.rulesetsToFunctions(rulesets) };
      rulesCollection = this.rulesetsToRules(rulesets, rulesCollection, functionStore);
    }

    return {
      rulesets: rSets,
      functionCollection: functionStore,
      ruleCollection: rulesCollection,
    };
  }

  private parseFunctionCollection(functionCollection: IFunctionCollection, includeCurrent: boolean) {
    const functionStore = includeCurrent ? this._functionCollection : defaultFunctions;
    return { ...functionStore, ...functionCollection };
  }

  private parseRuleDefinition(
    { name, format, rule }: { name: string; format: string; rule: types.Rule },
    functionStore: IFunctionCollection = {}
  ): IRuleEntry {
    const ruleIndex = this.toRuleIndex(name, format);
    try {
      jp.parse(rule.path);
    } catch (e) {
      throw new SyntaxError(`Invalid JSON path for rule '${ruleIndex}': ${rule.path}\n\n${e}`);
    }

    const ruleFunc = functionStore[rule.function] || this._functionCollection[rule.function];
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

  private rulesetToRules(
    ruleset: types.IRuleset,
    internalRuleStore: IRuleCollection,
    functionStore?: IFunctionCollection
  ): IRuleCollection {
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
          internalRuleStore[ruleIndex] = this.parseRuleDefinition({ name: ruleName, rule: r, format }, functionStore);
        } else {
          throw new Error(`Unknown rule definition format: ${r}`);
        }
      }
    }

    return internalRuleStore;
  }

  private rulesetsToRules(
    rulesets: types.IRuleset[],
    ruleCollection?: IRuleCollection,
    functionCollection?: IFunctionCollection
  ): IRuleCollection {
    const rules: IRuleCollection = merge({}, ruleCollection);

    for (const ruleset of rulesets) {
      merge(rules, this.rulesetToRules(ruleset, rules, functionCollection));
    }

    return rules;
  }

  private rulesetsToFunctions(rulesets: types.IRuleset[]): IFunctionCollection {
    let funcs = {};

    for (const ruleset of rulesets) {
      if (ruleset.functions) {
        funcs = { ...funcs, ...ruleset.functions };
      }
    }

    return funcs;
  }
}
