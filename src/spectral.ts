import {
  getLocationForJsonPath as getLocationForJsonPathJSON,
  JsonParserResult,
  parseWithPointers as parseJSONWithPointers,
  safeStringify,
} from '@stoplight/json';
import { Cache, Resolver } from '@stoplight/json-ref-resolver';
import { IUriParser } from '@stoplight/json-ref-resolver/types';
import { extname } from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import {
  getLocationForJsonPath as getLocationForJsonPathYAML,
  parseWithPointers as parseYAMLWithPointers,
  YamlParserResult,
} from '@stoplight/yaml';
import { merge, set } from 'lodash';

import { IDiagnostic } from '@stoplight/types/dist';
import deprecated from 'deprecated-decorator';
import { formatParserDiagnostics, formatResolverErrors } from './error-messages';
import { functions as defaultFunctions } from './functions';
import { listRefSiblings } from './listRefSiblings';
import { Resolved } from './resolved';
import { readRuleset } from './rulesets';
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
  RunRuleCollection,
} from './types';

export * from './types';

export class Spectral {
  private _resolver: Resolver;
  private _uriCache: Cache;
  public functions: FunctionCollection = { ...defaultFunctions };
  public rules: RunRuleCollection = {};

  public formats: RegisteredFormats;

  constructor(opts?: IConstructorOpts) {
    this._resolver = opts && opts.resolver ? opts.resolver : new Resolver();
    this.formats = {};
    this._uriCache = new Cache();
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
        uriCache: this._uriCache,
        baseUri: documentUri,
        parseResolveResult: this._parseResolveResult(refDiagnostics),
      }),
      this._parsedMap,
    );

    if (resolved.format === void 0) {
      const foundFormat = Object.keys(this.formats).find(format => this.formats[format](resolved.resolved));
      resolved.format = foundFormat === void 0 ? null : foundFormat;
    }

    const validationResults = [
      ...refDiagnostics,
      ...results,
      ...formatResolverErrors(resolved),
      ...listRefSiblings(parsedResult),
      ...runRules(resolved, this.rules, this.functions),
    ];

    return {
      resolved: resolved.resolved,
      results: validationResults,
    };
  }

  public async run(target: IParsedResult | object | string, opts: IRunOpts = {}): Promise<IRuleResult[]> {
    return (await this.runWithResolved(target, opts)).results;
  }

  @deprecated('loadRuleset', '4.1')
  public addFunctions(functions: FunctionCollection) {
    this._addFunctions(functions);
  }

  public _addFunctions(functions: FunctionCollection) {
    Object.assign(this.functions, functions);
  }

  public setFunctions(functions: FunctionCollection) {
    for (const key in this.functions) {
      if (!Object.hasOwnProperty.call(this.functions, key)) continue;
      delete this.functions[key];
    }

    this._addFunctions({ ...functions });
  }

  @deprecated('loadRuleset', '4.1')
  public addRules(rules: RuleCollection) {
    this._addRules(rules);
  }

  public setRules(rules: RuleCollection) {
    for (const key in this.rules) {
      if (!Object.hasOwnProperty.call(this.rules, key)) continue;
      delete this.rules[key];
    }

    this._addRules({ ...rules });
  }

  private _addRules(rules: RuleCollection) {
    for (const name in rules) {
      if (!rules.hasOwnProperty(name)) continue;
      const rule = rules[name];

      this.rules[name] = {
        name,
        ...rule,
        severity: rule.severity === void 0 ? DEFAULT_SEVERITY_LEVEL : getDiagnosticSeverity(rule.severity),
      };
    }
  }

  public mergeRules(rules: PartialRuleCollection) {
    for (const name in rules) {
      if (!rules.hasOwnProperty(name)) continue;
      const rule = rules[name];
      if (rule) {
        this.rules[name] = merge(this.rules[name], rule);
      }
    }
  }

  public async loadRuleset(uris: string[] | string) {
    const { rules, functions } = await readRuleset(uris);
    this._addRules(rules);
    this._addFunctions(functions);
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

  private _parseResolveResult = (refDiagnostics: IDiagnostic[]) => async (resolveOpts: IUriParser) => {
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
        refDiagnostics.push(...formatParserDiagnostics(parsedRefResult.parsed.diagnostics, parsedRefResult.source));
      }

      refDiagnostics.push(...listRefSiblings(parsedRefResult));

      this._processExternalRef(parsedRefResult, resolveOpts);
    }

    return resolveOpts;
  };
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
