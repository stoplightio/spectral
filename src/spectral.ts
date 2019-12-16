const md5 = require('blueimp-md5');

import { getLocationForJsonPath as getLocationForJsonPathJson, JsonParserResult, safeStringify } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { ICache, IUriParser } from '@stoplight/json-ref-resolver/types';
import { extname, normalize } from '@stoplight/path';
import { Dictionary, IDiagnostic, Optional } from '@stoplight/types';
import { getLocationForJsonPath as getLocationForJsonPathYaml, YamlParserResult } from '@stoplight/yaml';
import { memoize, merge, uniqBy } from 'lodash';

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
import { ComputeFingerprintFunc, defaultComputeResultFingerprint, empty } from './utils';

memoize.Cache = WeakMap;

export * from './types';

export class Spectral {
  public functions: FunctionCollection = { ...defaultFunctions };
  public rules: RunRuleCollection = {};
  public formats: RegisteredFormats;

  private readonly _computeFingerprint: ComputeFingerprintFunc;
  private readonly _resolver: IResolver;
  private readonly _parsedRefs: Dictionary<IParsedResult>;
  private static readonly _parsedCache = new WeakMap<ICache | IResolver, Dictionary<IParsedResult>>();

  constructor(opts?: IConstructorOpts) {
    this._computeFingerprint = memoize(opts?.computeFingerprint || defaultComputeResultFingerprint);
    this._resolver = opts && opts.resolver ? opts.resolver : new Resolver();
    this.formats = {};

    const cacheKey = this._resolver instanceof Resolver ? this._resolver.uriCache : this._resolver;
    const _parsedRefs = Spectral._parsedCache.get(cacheKey);
    if (_parsedRefs) {
      this._parsedRefs = _parsedRefs;
    } else {
      this._parsedRefs = {};

      Spectral._parsedCache.set(cacheKey, this._parsedRefs);
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
        // we need to normalize the path in case path with forward slashes is given
        source: opts.resolve?.documentUri && normalize(opts.resolve.documentUri),
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
      this._parsedRefs,
    );

    if (resolved.formats === void 0) {
      const foundFormats = Object.keys(this.formats).filter(format => this.formats[format](resolved.resolved));
      resolved.formats = foundFormats.length === 0 ? null : foundFormats;
    }

    const validationResults = [
      ...refDiagnostics,
      ...results,
      ...formatResolverErrors(resolved),
      ...runRules(resolved, this.rules, this.functions),
    ];

    // add fingerprint func to each result, to uniquely identify and group them
    const computeFingerprint = this._computeFingerprint;
    for (const r of validationResults) {
      Object.defineProperty(r, 'fingerprint', {
        get() {
          return computeFingerprint(r, md5);
        },
      });
    }

    return {
      resolved: resolved.resolved,
      results: uniqBy(validationResults, 'fingerprint'),
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

  private _parseResolveResult = (refDiagnostics: IDiagnostic[]) => async (resolveOpts: IUriParser) => {
    const ref = resolveOpts.targetAuthority.href().replace(/\/$/, '');
    const ext = extname(ref);

    const content = String(resolveOpts.result);
    let parsedRefResult: Optional<IParsedResult<YamlParserResult<unknown>> | IParsedResult<JsonParserResult<unknown>>>;
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

    if (parsedRefResult !== void 0) {
      resolveOpts.result = parsedRefResult.parsed.data;
      if (parsedRefResult.parsed.diagnostics.length > 0) {
        refDiagnostics.push(...formatParserDiagnostics(parsedRefResult.parsed.diagnostics, parsedRefResult.source));
      }

      this._parsedRefs[ref] = parsedRefResult;
    }

    return resolveOpts;
  };
}

export const isParsedResult = (obj: any): obj is IParsedResult => {
  if (!obj || typeof obj !== 'object') return false;
  if (!obj.parsed || typeof obj.parsed !== 'object') return false;
  if (!obj.getLocationForJsonPath || typeof obj.getLocationForJsonPath !== 'function') return false;

  return true;
};
