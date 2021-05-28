import { stringify } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { Dictionary, Optional } from '@stoplight/types';
import { YamlParserResult } from '@stoplight/yaml';
import { memoize, merge } from 'lodash';
import type { Agent } from 'http';
import type * as ProxyAgent from 'proxy-agent';

import { STATIC_ASSETS } from './assets';
import { Document, IDocument, IParsedResult, isParsedResult, ParsedDocument, normalizeSource } from './document';
import { DocumentInventory } from './documentInventory';
import { CoreFunctions, functions as coreFunctions } from './functions';
import * as Parsers from './parsers';
import request from './request';
import { createHttpAndFileResolver } from './resolvers/http-and-file';
import { OptimizedRule, Rule } from './rule';
import {
  compileExportedFunction,
  IRulesetReadOptions,
  setFunctionContext,
  readRuleset,
  getDiagnosticSeverity,
} from './ruleset';
import { mergeExceptions } from './ruleset/mergers/exceptions';
import { Runner, RunnerRuntime } from './runner';
import {
  FormatLookup,
  FunctionCollection,
  IConstructorOpts,
  IFunction,
  IFunctionContext,
  IResolver,
  IRuleResult,
  IRunOpts,
  ISpectralFullResult,
  PartialRuleCollection,
  RegisteredFormats,
  RuleCollection,
  RunRuleCollection,
} from './types';
import { IParserOptions, IRuleset, RulesetExceptionCollection } from './types/ruleset';
import { ComputeFingerprintFunc, defaultComputeResultFingerprint, empty, isNimmaEnvVariableSet } from './utils';
import { DEFAULT_PARSER_OPTIONS } from './consts';

memoize.Cache = WeakMap;

export * from './types';

export class Spectral {
  private readonly _resolver: IResolver;
  private readonly agent: Agent | undefined;

  public readonly functions: FunctionCollection & CoreFunctions = { ...coreFunctions };
  public readonly rules: RunRuleCollection = {};
  public readonly exceptions: RulesetExceptionCollection = {};
  public readonly formats: RegisteredFormats;
  public readonly parserOptions: Required<IParserOptions> = { ...DEFAULT_PARSER_OPTIONS };

  protected readonly runtime: RunnerRuntime;

  private readonly _computeFingerprint: ComputeFingerprintFunc;

  constructor(protected readonly opts?: IConstructorOpts) {
    this._computeFingerprint = memoize(opts?.computeFingerprint ?? defaultComputeResultFingerprint);

    if (opts?.proxyUri !== void 0) {
      // using eval so bundlers do not include proxy-agent when Spectral is used in the browser
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.agent = new (eval('require')('proxy-agent') as typeof ProxyAgent)(opts.proxyUri);
    }
    if (opts?.resolver !== void 0) {
      this._resolver = opts.resolver;
    } else {
      this._resolver =
        typeof window === 'undefined' ? createHttpAndFileResolver({ agent: this.agent }) : new Resolver();
    }

    this.formats = {};
    this.runtime = new RunnerRuntime();

    this.setFunctions(coreFunctions);
  }

  public static registerStaticAssets(assets: Dictionary<string, string>): void {
    empty(STATIC_ASSETS);
    Object.assign(STATIC_ASSETS, assets);
  }

  protected parseDocument(
    target: IParsedResult | IDocument | Record<string, unknown> | string,
    documentUri: Optional<string>,
  ): IDocument {
    const document =
      target instanceof Document
        ? target
        : isParsedResult(target)
        ? new ParsedDocument(target)
        : new Document<unknown, YamlParserResult<unknown>>(
            typeof target === 'string' ? target : stringify(target, void 0, 2),
            Parsers.Yaml,
            documentUri,
          );

    let i = -1;
    for (const diagnostic of document.diagnostics.slice()) {
      i++;
      if (diagnostic.code !== 'parser') continue;

      if (diagnostic.message.startsWith('Mapping key must be a string scalar rather than')) {
        diagnostic.severity = getDiagnosticSeverity(this.parserOptions.incompatibleValues);
      } else if (diagnostic.message.startsWith('Duplicate key')) {
        diagnostic.severity = getDiagnosticSeverity(this.parserOptions.duplicateKeys);
      }

      if (diagnostic.severity === -1) {
        document.diagnostics.splice(i, 1);
        i--;
      }
    }

    return document;
  }

  public async runWithResolved(
    target: IParsedResult | IDocument | Record<string, unknown> | string,
    opts: IRunOpts = {},
  ): Promise<ISpectralFullResult> {
    const document = this.parseDocument(target, opts.resolve?.documentUri);

    if (document.source === null && opts.resolve?.documentUri !== void 0) {
      (document as Omit<Document, 'source'> & { source: string }).source = normalizeSource(opts.resolve.documentUri);
    }

    const inventory = new DocumentInventory(document, this._resolver);
    await inventory.resolve();

    const runner = new Runner(this.runtime, inventory);

    if (document.formats === void 0) {
      const registeredFormats = Object.keys(this.formats);
      const foundFormats = registeredFormats.filter(format =>
        this.formats[format](inventory.resolved, document.source ?? void 0),
      );
      if (foundFormats.length === 0 && opts.ignoreUnknownFormat !== true) {
        document.formats = null;
        if (registeredFormats.length > 0) {
          throw new Error(
            `The provided document does not match any of the registered formats [${Object.keys(this.formats).join(
              ', ',
            )}]`,
          );
        }
      } else {
        document.formats = foundFormats;
      }
    }

    await runner.run({
      rules: this.rules,
      functions: this.functions,
      exceptions: this.exceptions,
    });

    const results = runner.getResults(this._computeFingerprint);

    return {
      resolved: inventory.resolved,
      results,
    };
  }

  public async run(
    target: IParsedResult | IDocument | Record<string, unknown> | string,
    opts: IRunOpts = {},
  ): Promise<IRuleResult[]> {
    return (await this.runWithResolved(target, opts)).results;
  }

  public setFunctions(functions: FunctionCollection): void {
    empty(this.functions);

    const mergedFunctions = { ...coreFunctions, ...functions };

    for (const key of Object.keys(mergedFunctions)) {
      const context: IFunctionContext = {
        functions: this.functions,
        cache: new Map(),
      };

      this.functions[key] = setFunctionContext<IFunction>(context, mergedFunctions[key]);
    }
  }

  public setRules(rules: RuleCollection): void {
    empty(this.rules);

    for (const [name, rule] of Object.entries(rules)) {
      if (this.opts?.useNimma === true || isNimmaEnvVariableSet()) {
        try {
          this.rules[name] = new OptimizedRule(name, rule);
        } catch {
          this.rules[name] = new Rule(name, rule);
        }
      } else {
        this.rules[name] = new Rule(name, rule);
      }
    }
  }

  public mergeRules(rules: PartialRuleCollection): void {
    for (const [name, rule] of Object.entries(rules)) {
      this.rules[name] = merge(this.rules[name], rule);
    }
  }

  private setExceptions(exceptions: RulesetExceptionCollection): void {
    const target: RulesetExceptionCollection = {};
    mergeExceptions(target, exceptions);

    empty(this.exceptions);

    Object.assign(this.exceptions, target);
  }

  public async loadRuleset(uris: string[] | string, options?: IRulesetReadOptions): Promise<void> {
    this.setRuleset(await readRuleset(Array.isArray(uris) ? uris : [uris], { agent: this.agent, ...options }));
  }

  public setRuleset(ruleset: IRuleset): void {
    this.runtime.revoke();

    this.setRules(ruleset.rules);

    this.setFunctions(
      Object.entries(ruleset.functions).reduce<FunctionCollection>(
        (fns, [key, { code, ref, name, source, schema }]) => {
          if (code === void 0) {
            if (ref !== void 0) {
              ({ code } = ruleset.functions[ref]);
            }
          }

          if (code === void 0) {
            // shall we log or sth?
            return fns;
          }

          fns[key] = compileExportedFunction({
            code,
            name,
            source,
            schema,
            inject: {
              fetch: request,
              spectral: this.runtime.spawn(),
            },
          });

          return fns;
        },
        {},
      ),
    );

    this.setExceptions(ruleset.exceptions);

    if (ruleset.parserOptions !== void 0) {
      Object.assign<Required<IParserOptions>, IParserOptions>(this.parserOptions, ruleset.parserOptions);
    }
  }

  public registerFormat(format: string, fn: FormatLookup): void {
    this.formats[format] = fn;
  }
}
