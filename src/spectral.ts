import { safeStringify } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { parseWithPointers } from '@stoplight/yaml';

import merge = require('lodash/merge');

import { functions as defaultFunctions } from './functions';
import { runRules } from './runner';
import {
  FunctionCollection,
  IConstructorOpts,
  IParsedResult,
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

  public async run(target: IParsedResult | object | string): Promise<IRuleResult[]> {
    let parsed: IParsedResult;
    if (!isParserMeta(target)) {
      parsed = parseWithPointers(typeof target === 'string' ? target : safeStringify(target, undefined, 2));
    } else {
      parsed = target;
    }

    const resolvedTarget = (await this.resolver.resolve(parsed.data)).result;
    return runRules(parsed, this.rules, this.functions, { resolvedTarget });
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

const isParserMeta = (obj: unknown): obj is IParsedResult =>
  typeof obj === 'object' &&
  obj !== null &&
  'data' in obj &&
  (obj as Partial<{ data: any }>).data !== undefined &&
  'ast' in obj &&
  typeof (obj as Partial<{ ast: any }>).ast === 'object' &&
  'diagnostics' in obj &&
  Array.isArray((obj as Partial<{ diagnostics: any }>).diagnostics) &&
  'lineMap' in obj &&
  Array.isArray((obj as Partial<{ lineMap: any }>).lineMap);
