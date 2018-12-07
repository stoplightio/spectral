const merge = require('lodash/merge');
const values = require('lodash/values');
const compact = require('lodash/compact');
const flatten = require('lodash/flatten');
import * as jp from 'jsonpath';

import { PathComponent } from 'jsonpath';
import { functions as defaultFunctions } from './functions';
import * as types from './types';
import { IFunctionCollection, IRuleCollection, IRuleEntry, IRunOpts, IRunResult } from './types/spectral';

export class Spectral {
  // normalized object for holding rule definitions indexed by ${format}-${name}
  private _rulesByIndex: IRuleCollection = {};
  private _functionCollection: IFunctionCollection = defaultFunctions;

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

  public setFunctions(functionCollection: IFunctionCollection) {
    this._functionCollection = merge({}, defaultFunctions, functionCollection);
  }

  public mergeFunctions(functionCollection: IFunctionCollection) {
    this._functionCollection = merge({}, this._functionCollection, functionCollection);
  }

  public setRules(ruleStore: types.IRuleStore) {
    this._rulesByIndex = this.toRuleCollection(ruleStore, {});
  }

  public mergeRules(ruleStore: types.IRuleStore) {
    this._rulesByIndex = this.toRuleCollection(ruleStore, merge({}, this._rulesByIndex));
  }

  private toRuleCollection(ruleStore: types.IRuleStore, internalRuleStore: IRuleCollection): IRuleCollection {
    for (const format of Object.keys(ruleStore)) {
      for (const ruleName of Object.keys(ruleStore[format])) {
        const rule = ruleStore[format][ruleName];
        const ruleIndex = this.toRuleIndex(ruleName, format);
        if (typeof rule === 'boolean') {
          // enabling/disabling rule
          if (!internalRuleStore[ruleIndex]) {
            console.warn(
              `Unable to find rule matching name '${ruleName}' under format ${format} - this entry has no effect`
            );
            continue;
          }

          internalRuleStore[ruleIndex].rule.enabled = rule;
        } else if (typeof rule === 'object' && !Array.isArray(rule)) {
          // rule definition
          internalRuleStore[ruleIndex] = this.parseRuleDefinition(ruleName, format, rule);
        } else {
          throw new Error(`Unknown rule definition format: ${rule}`);
        }
      }
    }

    return internalRuleStore;
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
    const nodes = jp.nodes(target, ruleEntry.rule.given);
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

    if (ruleEntry.rule.given === '$') {
      // allow resolved and stringified targets to be passed to rules when operating on
      // the root path
      if (opts.resolvedTarget) {
        opt.resObj = opts.resolvedTarget;
      }
    }

    return ruleEntry.apply(opt);
  }

  private parseRuleDefinition(name: string, format: string, rule: types.Rule): IRuleEntry {
    const ruleIndex = this.toRuleIndex(name, format);
    try {
      jp.parse(rule.given);
    } catch (e) {
      throw new SyntaxError(`Invalid JSON path for rule '${ruleIndex}': ${rule.given}\n\n${e}`);
    }

    const ruleFunc = this._functionCollection[rule.function];

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
}
