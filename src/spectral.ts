import { safeStringify } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { IUriParser } from '@stoplight/json-ref-resolver/types';
import { getLocationForJsonPath as getLocationForJsonPathJSON } from '@stoplight/json/getLocationForJsonPath';
import { parseWithPointers as parseJSONWithPointers } from '@stoplight/json/parseWithPointers';
import { DiagnosticSeverity, Dictionary, IParserResult } from '@stoplight/types';
import {
  getLocationForJsonPath as getLocationForJsonPathYAML,
  parseWithPointers as parseYAMLWithPointers,
} from '@stoplight/yaml';
import { merge, set, uniqBy } from 'lodash';
import { extname } from 'path';

import { functions as defaultFunctions } from './functions';
import { Resolved } from './resolved';
import { runRules } from './runner';
import {
  FunctionCollection,
  IConstructorOpts,
  IParsedResult,
  IRuleResult,
  IRunOpts,
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

  public async run(target: IParsedResult | object | string, opts: IRunOpts = {}): Promise<IRuleResult[]> {
    let results: IRuleResult[] = [];

    let parsedResult: IParsedResult;
    if (!isParsedResult(target)) {
      parsedResult = {
        parsed: parseYAMLWithPointers(typeof target === 'string' ? target : safeStringify(target, undefined, 2)),
        getLocationForJsonPath: getLocationForJsonPathYAML,
      };
      results = results.concat(formatParserDiagnostics(parsedResult.parsed, parsedResult.source));
    } else {
      parsedResult = target;
    }

    const documentUri = opts.resolve && opts.resolve.documentUri;
    const refDiagnostics: IRuleResult[] = [];

    const resolved = new Resolved(
      parsedResult,
      await this._resolver.resolve(parsedResult.parsed.data, {
        baseUri: documentUri,
        parseResolveResult: async resolveOpts => {
          const ref = resolveOpts.targetAuthority.toString();
          const ext = extname(ref);

          const content = String(resolveOpts.result);
          let parsedRefResult: IParsedResult | void;
          if (ext === '.yml' || ext === '.yaml') {
            parsedRefResult = {
              parsed: parseYAMLWithPointers(content),
              source: ref,
              getLocationForJsonPath: getLocationForJsonPathYAML,
            };
          } else if (ext === '.json') {
            parsedRefResult = {
              parsed: parseJSONWithPointers(content),
              source: ref,
              getLocationForJsonPath: getLocationForJsonPathJSON,
            };
          }

          if (parsedRefResult !== undefined) {
            resolveOpts.result = parsedRefResult.parsed.data;
            if (parsedRefResult.parsed.diagnostics.length > 0) {
              refDiagnostics.push(...formatParserDiagnostics(parsedRefResult.parsed, parsedRefResult.source));
            }

            this._processExternalRef(parsedRefResult, resolveOpts);
          }

          return resolveOpts;
        },
      }),
      this._parsedMap,
    );

    return [
      ...refDiagnostics,
      ...results,
      ...formatResolverErrors(resolved),
      ...runRules(resolved, this.rules, this.functions),
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
          this._rules[ruleName].recommended = declaration;
        }
      }
    }
  }

  private _parsedMap: IParseMap = {
    refs: {},
    parsed: {},
    pointers: {},
  };

  private _processExternalRef(parsedResult: IParsedResult, opts: IUriParser) {
    const ref = opts.targetAuthority.toString();
    this._parsedMap.parsed[ref] = parsedResult;
    this._parsedMap.pointers[ref] = opts.parentPath;
    const parentRef = opts.parentAuthority.toString();

    set(
      this._parsedMap.refs,
      [...(this._parsedMap.pointers[parentRef] ? this._parsedMap.pointers[parentRef] : []), ...opts.parentPath],
      Object.defineProperty({}, REF_METADATA, {
        enumerable: false,
        writable: false,
        value: {
          ref,
          root: opts.fragment.split('/').slice(1),
        },
      }),
    );
  }
}

export const REF_METADATA = Symbol('external_ref_metadata');

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

const formatResolverErrors = (resolved: Resolved): IRuleResult[] => {
  return uniqBy(resolved.errors, 'message').reduce<IRuleResult[]>((errors, error) => {
    const path = [...error.path, '$ref'];
    const location = resolved.getLocationForJsonPath(path);

    if (location) {
      errors.push({
        code: 'invalid-ref',
        path,
        message: prettyPrintResolverError(error.message),
        severity: DiagnosticSeverity.Error,
        range: location.range,
        source: resolved.spec.source,
      });
    }

    return errors;
  }, []);
};

export interface IParseMap {
  refs: Dictionary<object>;
  parsed: Dictionary<IParsedResult>;
  pointers: Dictionary<string[]>;
}
