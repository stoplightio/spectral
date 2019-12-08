import { getLocationForJsonPath as getLocationForJsonPathJson, JsonParserResult, safeStringify } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { ICache, IUriParser } from '@stoplight/json-ref-resolver/types';
import { extname } from '@stoplight/path';
import { DiagnosticSeverity, Dictionary, IDiagnostic } from '@stoplight/types';
import { getLocationForJsonPath as getLocationForJsonPathYaml, YamlParserResult } from '@stoplight/yaml';
import { merge, set } from 'lodash';

import { STATIC_ASSETS } from './assets';
import { formatParserDiagnostics, formatResolverErrors } from './error-messages';
import { functions as defaultFunctions } from './functions';
import { parseJson, parseYaml } from './parsers';
import { Resolved } from './resolved';
import { readRuleset } from './rulesets';
import { compileExportedFunction } from './rulesets/evaluators';
import { IRulesetReadOptions } from './rulesets/reader';
import { DEFAULT_SEVERITY_LEVEL, getDiagnosticSeverity } from './rulesets/severity';
import { runRules } from './runner';
import {
  FormatLookup,
  FunctionCollection,
  IConstructorOpts,
  IParsedResult,
  IResolver,
  IRuleResult,
  IRunOpts,
  ISpectralFullResult,
  PartialRuleCollection,
  RegisteredFormats,
  RuleCollection,
  RunRuleCollection,
} from './types';
import { IRuleset } from './types/ruleset';
import { empty } from './utils';

export * from './types';

export class Spectral {
  private readonly _resolver: IResolver;
  private readonly _parsedMap: IParseMap;
  private static readonly _parsedCache = new WeakMap<ICache | IResolver, IParseMap>();
  public functions: FunctionCollection = { ...defaultFunctions };
  public rules: RunRuleCollection = {};

  public formats: RegisteredFormats;

  constructor(opts?: IConstructorOpts) {
    this._resolver = opts && opts.resolver ? opts.resolver : new Resolver();
    this.formats = {};

    const cacheKey = this._resolver instanceof Resolver ? this._resolver.uriCache : this._resolver;
    const _parsedMap = Spectral._parsedCache.get(cacheKey);
    if (_parsedMap) {
      this._parsedMap = _parsedMap;
    } else {
      this._parsedMap = {
        refs: {},
        parsed: {},
        pointers: {},
      };

      Spectral._parsedCache.set(cacheKey, this._parsedMap);
    }
  }

  public static registerStaticAssets(assets: Dictionary<string, string>) {
    empty(STATIC_ASSETS);
    Object.assign(STATIC_ASSETS, assets);
  }

  public async runWithResolved(
    target: IParsedResult | object | string,
    opts: IRunOpts = {},
  ): Promise<ISpectralFullResult> {
    let results: IRuleResult[] = [];

    let parsedResult: IParsedResult | IParsedResult<YamlParserResult<unknown>>;
    if (!isParsedResult(target)) {
      parsedResult = {
        parsed: parseYaml(typeof target === 'string' ? target : safeStringify(target, undefined, 2)),
        getLocationForJsonPath: getLocationForJsonPathYaml,
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
        parseResolveResult: this._parseResolveResult(refDiagnostics),
      }),
      this._parsedMap,
    );

    const validationResults = [...refDiagnostics, ...results, ...formatResolverErrors(resolved)];

    if (resolved.formats === void 0) {
      const registeredFormats = Object.keys(this.formats);
      const foundFormats = registeredFormats.filter(format => this.formats[format](resolved.resolved));
      if (foundFormats.length === 0) {
        resolved.formats = null;
        if (registeredFormats.length > 0) {
          validationResults.push(Spectral._generateUnrecognizedFormatError(parsedResult));
        }
      } else {
        resolved.formats = foundFormats;
      }
    }

    return {
      resolved: resolved.resolved,
      results: [...validationResults, ...runRules(resolved, this.rules, this.functions)],
    };
  }

  public async run(target: IParsedResult | object | string, opts: IRunOpts = {}): Promise<IRuleResult[]> {
    return (await this.runWithResolved(target, opts)).results;
  }

  public setFunctions(functions: FunctionCollection) {
    empty(this.functions);

    Object.assign(this.functions, { ...defaultFunctions, ...functions });
  }

  public setRules(rules: RuleCollection) {
    empty(this.rules);

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

  public async loadRuleset(uris: string[] | string, options?: IRulesetReadOptions) {
    this.setRuleset(await readRuleset(Array.isArray(uris) ? uris : [uris], options));
  }

  public setRuleset(ruleset: IRuleset) {
    this.setRules(ruleset.rules);

    this.setFunctions(
      Object.entries(ruleset.functions).reduce<FunctionCollection>(
        (fns, [key, { code, ref, name, schema }]) => {
          if (code === void 0) {
            if (ref !== void 0) {
              ({ code } = ruleset.functions[ref]);
            }
          }

          if (code === void 0) {
            // shall we log or sth?
            return fns;
          }

          fns[key] = compileExportedFunction(code, name, schema);
          return fns;
        },
        {
          ...defaultFunctions,
        },
      ),
    );
  }

  public registerFormat(format: string, fn: FormatLookup) {
    this.formats[format] = fn;
  }

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
        parsed: parseYaml(content),
        source: ref,
        getLocationForJsonPath: getLocationForJsonPathYaml,
      };
    } else if (ext === '.json') {
      parsedRefResult = {
        parsed: parseJson(content),
        source: ref,
        getLocationForJsonPath: getLocationForJsonPathJson,
      };
    }

    if (parsedRefResult !== undefined) {
      resolveOpts.result = parsedRefResult.parsed.data;
      if (parsedRefResult.parsed.diagnostics.length > 0) {
        refDiagnostics.push(...formatParserDiagnostics(parsedRefResult.parsed.diagnostics, parsedRefResult.source));
      }

      this._processExternalRef(parsedRefResult, resolveOpts);
    }

    return resolveOpts;
  };

  private static _generateUnrecognizedFormatError(parsedResult: IParsedResult): IRuleResult {
    return {
      range: parsedResult.getLocationForJsonPath(parsedResult.parsed, [], true)?.range || {
        start: { character: 0, line: 0 },
        end: { character: 0, line: 0 },
      },
      message: 'Provided file format does not match any of the registered formats',
      code: 'unrecognized-format',
      severity: DiagnosticSeverity.Information,
      source: parsedResult.source,
      path: [],
    };
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
