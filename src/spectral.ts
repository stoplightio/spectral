import { Resolver } from '@stoplight/json-ref-resolver';

const merge = require('lodash/merge');

import { functions as defaultFunctions } from './functions';
import { runRules } from './runner';
import {
  FunctionCollection,
  IConstructorOpts,
  IParserMeta,
  IRuleResult,
  PartialRuleCollection,
  RuleCollection,
  RuleDeclarationCollection,
  RunRuleCollection,
} from './types';

export * from './types';

export class Spectral {
  private _rules: RuleCollection = {};
  private _functions: FunctionCollection = defaultFunctions;

  private resolver: any;
  constructor(opts?: IConstructorOpts) {
    this.resolver = opts && opts.resolver ? opts.resolver : new Resolver();
  }

  public async run(target: object, parserMeta?: IParserMeta): Promise<IRuleResult[]> {
    const resolvedTarget = (await this.resolver.resolve(target)).result;
    return runRules(target, this.rules, this.functions, { resolvedTarget, parserMeta });
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
      if (!this._rules.hasOwnProperty(name)) continue;
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

  public mergeRules(rules: PartialRuleCollection) {
    for (const ruleName in merge({}, rules)) {
      if (!rules.hasOwnProperty(ruleName)) continue;
      const rule = rules[ruleName];
      if (rule) {
        this._rules[ruleName] = merge(this._rules[ruleName], rule);
      }
    }
  }

  public applyRuleDeclarations(declarations: RuleDeclarationCollection) {
    for (const ruleName in declarations) {
      if (!declarations.hasOwnProperty(ruleName)) continue;
      const declaration = declarations[ruleName];

      const rule = this.rules[ruleName];
      if (rule) {
        if (typeof declaration === 'boolean') {
          this._rules[ruleName].enabled = declaration;
        }
      }
    }
  }
}
