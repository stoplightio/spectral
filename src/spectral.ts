import { safeStringify } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { IResolveError } from '@stoplight/json-ref-resolver/types';
import { DiagnosticSeverity, IParserResult } from '@stoplight/types';
import { getLocationForJsonPath, parseWithPointers } from '@stoplight/yaml';
import { merge, uniqBy } from 'lodash';

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
  private _resolver: Resolver;

  constructor(opts?: IConstructorOpts) {
    this._resolver = opts && opts.resolver ? opts.resolver : new Resolver();
  }

  public async run(target: IParsedResult | object | string): Promise<IRuleResult[]> {
    let results: IRuleResult[] = [];

    let parsedResult: IParsedResult;
    if (!isParsedResult(target)) {
      parsedResult = {
        parsed: parseWithPointers(typeof target === 'string' ? target : safeStringify(target, undefined, 2)),
        getLocationForJsonPath,
      };
      results = results.concat(formatParserDiagnostics(parsedResult.parsed, parsedResult.source));
    } else {
      parsedResult = target;
    }

    const { result: resolvedTarget, errors } = await this._resolver.resolve(parsedResult.parsed.data);

    return [
      ...results,
      ...formatResolverErrors(errors, parsedResult),
      ...runRules(parsedResult, this.rules, this.functions, { resolvedTarget }),
    ];
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

export const isParsedResult = (obj: any): obj is IParsedResult => {
  if (!obj || typeof obj !== 'object') return false;
  if (!obj.parsed || typeof obj.parsed !== 'object') return false;
  if (!obj.getLocationForJsonPath || typeof obj.getLocationForJsonPath !== 'function') return false;

  return true;
};

function formatParserDiagnostics(parsed: IParserResult, source?: string): IRuleResult[] {
  return parsed.diagnostics.map(diagnostic => ({
    ...diagnostic,
    path: [],
    source,
  }));
}

const prettyPrintResolverError = (message: string) => message.replace(/^Error\s*:\s*/, '');

const formatResolverErrors = (resolveErrors: IResolveError[], result: IParsedResult): IRuleResult[] => {
  return uniqBy(resolveErrors, 'message').reduce<IRuleResult[]>((errors, error) => {
    const path = [...error.path, '$ref'];
    const location = result.getLocationForJsonPath(result.parsed, path);

    if (location) {
      errors.push({
        code: 'invalid-ref',
        path,
        message: prettyPrintResolverError(error.message),
        severity: DiagnosticSeverity.Error,
        range: location.range,
      });
    }

    return errors;
  }, []);
};
