import { JsonParserResult, safeStringify } from '@stoplight/json';
import {
  getLocationForJsonPath as getLocationForJsonPathJSON,
  parseWithPointers as parseJSONWithPointers,
} from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { IUriParser } from '@stoplight/json-ref-resolver/types';
import { extname } from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import {
  getLocationForJsonPath as getLocationForJsonPathYAML,
  parseWithPointers as parseYAMLWithPointers,
  YamlParserResult,
} from '@stoplight/yaml';
import { merge, set } from 'lodash';

import deprecated from 'deprecated-decorator';
import { formatParserDiagnostics, formatResolverErrors } from './error-messages';
import { functions as defaultFunctions } from './functions';
import { Resolved } from './resolved';
import { readRulesFromRulesets } from './rulesets';
import { DEFAULT_SEVERITY_LEVEL, getDiagnosticSeverity } from './rulesets/severity';
import { runRules } from './runner';
import {
  FormatLookup,
  FunctionCollection,
  IConstructorOpts,
  IParsedResult,
  IRuleResult,
  IRunOpts,
  ISpectralFullResult,
  PartialRuleCollection,
  RegisteredFormats,
  RuleCollection,
  RuleDeclarationCollection,
  RunRuleCollection,
} from './types';

export * from './types';

export class Spectral {
  private _rules: RuleCollection = {};
  private _functions: FunctionCollection = defaultFunctions;
  private _resolver: Resolver;

  public formats: RegisteredFormats;

  constructor(opts?: IConstructorOpts) {
    this._resolver = opts && opts.resolver ? opts.resolver : new Resolver();
    this.formats = {};
  }

  public async runWithResolved(
    target: IParsedResult | object | string,
    opts: IRunOpts = {},
  ): Promise<ISpectralFullResult> {
    let results: IRuleResult[] = [];

    let parsedResult: IParsedResult | IParsedResult<YamlParserResult<unknown>>;
    if (!isParsedResult(target)) {
      parsedResult = {
        parsed: parseYAMLWithPointers(typeof target === 'string' ? target : safeStringify(target, undefined, 2), {
          ignoreDuplicateKeys: false,
          mergeKeys: true,
        }),
        getLocationForJsonPath: getLocationForJsonPathYAML,
      };
    } else {
      parsedResult = target;
    }

    results = results.concat(formatParserDiagnostics(parsedResult.parsed.diagnostics, parsedResult.source));

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
          let parsedRefResult:
            | IParsedResult<YamlParserResult<unknown>>
            | IParsedResult<JsonParserResult<unknown>>
            | undefined;
          if (ext === '.yml' || ext === '.yaml') {
            parsedRefResult = {
              parsed: parseYAMLWithPointers(content, { ignoreDuplicateKeys: false }),
              source: ref,
              getLocationForJsonPath: getLocationForJsonPathYAML,
            };
          } else if (ext === '.json') {
            parsedRefResult = {
              parsed: parseJSONWithPointers(content, { ignoreDuplicateKeys: false }),
              source: ref,
              getLocationForJsonPath: getLocationForJsonPathJSON,
            };
          }

          if (parsedRefResult !== undefined) {
            resolveOpts.result = parsedRefResult.parsed.data;
            if (parsedRefResult.parsed.diagnostics.length > 0) {
              refDiagnostics.push(
                ...formatParserDiagnostics(parsedRefResult.parsed.diagnostics, parsedRefResult.source),
              );
            }

            this._processExternalRef(parsedRefResult, resolveOpts);
          }

          return resolveOpts;
        },
      }),
      this._parsedMap,
    );

    if (resolved.format === void 0) {
      const foundFormat = Object.keys(this.formats).find(format => this.formats[format](resolved.result));
      resolved.format = foundFormat === void 0 ? null : foundFormat;
    }

    const validationResults = [
      ...refDiagnostics,
      ...results,
      ...formatResolverErrors(resolved),
      ...runRules(resolved, this.rules, this.functions),
    ];

    return {
      resolved: resolved.result,
      results: validationResults,
    };
  }

  public async run(target: IParsedResult | object | string, opts: IRunOpts = {}): Promise<IRuleResult[]> {
    return (await this.runWithResolved(target, opts)).results;
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

  public async loadRuleset(...uris: string[]) {
    this._addRules(await readRulesFromRulesets(...uris));
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
        severity: rule.severity === undefined ? DEFAULT_SEVERITY_LEVEL : getDiagnosticSeverity(rule.severity),
      };
    }

    return rules;
  }

  @deprecated('loadRuleset', '4.1')
  public addRules(rules: RuleCollection) {
    this._addRules(rules);
  }

  private _addRules(rules: RuleCollection) {
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

  public registerFormat(format: string, fn: FormatLookup) {
    this.formats[format] = fn;
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

export interface IParseMap {
  refs: Dictionary<object>;
  parsed: Dictionary<IParsedResult>;
  pointers: Dictionary<string[]>;
}
