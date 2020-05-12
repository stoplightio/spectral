import { safeStringify } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { YamlParserResult } from '@stoplight/yaml';
import { memoize, merge } from 'lodash';

import { STATIC_ASSETS } from './assets';
import { Document, IDocument, IParsedResult, isParsedResult, ParsedDocument } from './document';
import { DocumentInventory } from './documentInventory';
import { CoreFunctions, functions as coreFunctions } from './functions';
import * as Parsers from './parsers';
import request from './request';
import { Rule } from './rule';
import { readRuleset } from './rulesets';
import { compileExportedFunction, setFunctionContext } from './rulesets/evaluators';
import { mergeExceptions } from './rulesets/mergers/exceptions';
import { IRulesetReadOptions } from './rulesets/reader';
import { runRules } from './runner/runner';
import {
  FormatLookup,
  FunctionCollection,
  IConstructorOpts,
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
import { IRuleset, RulesetExceptionCollection } from './types/ruleset';
import { ComputeFingerprintFunc, defaultComputeResultFingerprint, empty, prepareResults } from './utils';
import { generateDocumentWideResult } from './utils/generateDocumentWideResult';

memoize.Cache = WeakMap;

export * from './types';

export class Spectral {
  private readonly _resolver: IResolver;

  public functions: FunctionCollection & CoreFunctions = { ...coreFunctions };
  public rules: RunRuleCollection = {};
  public exceptions: RulesetExceptionCollection = {};
  public formats: RegisteredFormats;

  private readonly _computeFingerprint: ComputeFingerprintFunc;

  constructor(opts?: IConstructorOpts) {
    this._computeFingerprint = memoize(opts?.computeFingerprint ?? defaultComputeResultFingerprint);
    this._resolver = opts?.resolver ?? new Resolver();
    this.formats = {};
  }

  public static registerStaticAssets(assets: Dictionary<string, string>) {
    empty(STATIC_ASSETS);
    Object.assign(STATIC_ASSETS, assets);
  }

  public async runWithResolved(
    target: IParsedResult | IDocument | object | string,
    opts: IRunOpts = {},
  ): Promise<ISpectralFullResult> {
    const document: IDocument =
      target instanceof Document
        ? target
        : isParsedResult(target)
        ? new ParsedDocument(target)
        : new Document<unknown, YamlParserResult<unknown>>(
            typeof target === 'string' ? target : safeStringify(target, undefined, 2),
            Parsers.Yaml,
            opts.resolve?.documentUri,
          );

    if (document.source === null && opts.resolve?.documentUri !== void 0) {
      (document as Omit<Document, 'source'> & { source: string }).source = opts.resolve?.documentUri;
    }

    const inventory = new DocumentInventory(document, this._resolver);
    await inventory.resolve();

    const validationResults: IRuleResult[] = [...inventory.diagnostics, ...document.diagnostics, ...inventory.errors];

    if (document.formats === void 0) {
      const registeredFormats = Object.keys(this.formats);
      const foundFormats = registeredFormats.filter(format => this.formats[format](inventory.resolved));
      if (foundFormats.length === 0 && opts.ignoreUnknownFormat !== true) {
        document.formats = null;
        if (registeredFormats.length > 0) {
          validationResults.push(this._generateUnrecognizedFormatError(document));
        }
      } else {
        document.formats = foundFormats;
      }
    }

    return {
      resolved: inventory.resolved,
      results: prepareResults(
        [
          ...validationResults,
          ...(await runRules({
            documentInventory: inventory,
            rules: this.rules,
            functions: this.functions,
            exceptions: this.exceptions,
          })),
        ],
        this._computeFingerprint,
      ),
    };
  }

  public async run(target: IParsedResult | Document | object | string, opts: IRunOpts = {}): Promise<IRuleResult[]> {
    return (await this.runWithResolved(target, opts)).results;
  }

  public setFunctions(functions: FunctionCollection) {
    empty(this.functions);

    Object.assign(this.functions, { ...coreFunctions, ...functions });
  }

  public setRules(rules: RuleCollection) {
    empty(this.rules);

    for (const [name, rule] of Object.entries(rules)) {
      this.rules[name] = new Rule(name, rule);
    }
  }

  public mergeRules(rules: PartialRuleCollection) {
    for (const [name, rule] of Object.entries(rules)) {
      this.rules[name] = merge(this.rules[name], rule);
    }
  }

  private setExceptions(exceptions: RulesetExceptionCollection) {
    const target: RulesetExceptionCollection = {};
    mergeExceptions(target, exceptions);

    empty(this.exceptions);

    Object.assign(this.exceptions, target);
  }

  public async loadRuleset(uris: string[] | string, options?: IRulesetReadOptions) {
    this.setRuleset(await readRuleset(Array.isArray(uris) ? uris : [uris], options));
  }

  public setRuleset(ruleset: IRuleset) {
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

          const context: IFunctionContext = {
            functions: this.functions,
            cache: new Map(),
          };

          fns[key] = setFunctionContext(
            context,
            compileExportedFunction({
              code,
              name,
              source,
              schema,
              inject: {
                fetch: request,
              },
            }),
          );
          return fns;
        },
        {
          ...coreFunctions,
        },
      ),
    );

    this.setExceptions(ruleset.exceptions);
  }

  public registerFormat(format: string, fn: FormatLookup) {
    this.formats[format] = fn;
  }

  private _generateUnrecognizedFormatError(document: IDocument): IRuleResult {
    return generateDocumentWideResult(
      document,
      `The provided document does not match any of the registered formats [${Object.keys(this.formats).join(', ')}]`,
      DiagnosticSeverity.Warning,
      'unrecognized-format',
    );
  }
}
