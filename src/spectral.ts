const merge = require('lodash/merge');

import { functions as defaultFunctions } from './functions';
import { runRules } from './runner';
import { FunctionCollection, IRunOpts, IRunResult, RuleCollection, RuleDeclaration, RunRuleCollection } from './types';

export class Spectral {
  private _rules: RuleCollection = {};
  private _functions: FunctionCollection = defaultFunctions;

  public run(target: object, opts: IRunOpts = {}): IRunResult {
    return runRules(target, this.rules, this.functions, opts);
  }

  /**
   * Functions
   */

  public get functions(): FunctionCollection {
    return this._functions;
  }

  public addFunctions(functions: FunctionCollection) {
    Object.assign(this._functions, merge({}, functions));
  }

  /**
   * Rules
   */

  public get rules(): RunRuleCollection {
    const rules: RunRuleCollection = {};

    for (const name in this._rules) {
      const rule = this._rules[name];

      rules[name] = {
        name,
        ...rule,
      };
    }

    return rules;
  }

  public addRules(rules: RuleCollection) {
    Object.assign(this._rules, merge({}, rules));
  }

  public mergeRules(rules: RuleDeclaration) {
    for (const ruleName in merge({}, rules)) {
      const rule = rules[ruleName];
      if (typeof rule === 'boolean') {
        if (!this._rules[ruleName]) {
          console.warn(`Unable to find rule matching name '${ruleName}' - this merge entry has no effect`);
          continue;
        }

        this._rules[ruleName].enabled = rule;
      } else {
        this._rules[ruleName] = merge(this._rules[ruleName], rule);
      }
    }
  }
}
