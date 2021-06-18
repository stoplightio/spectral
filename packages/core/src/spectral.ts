import { stringify } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { DiagnosticSeverity, Optional } from '@stoplight/types';
import * as Parsers from '@stoplight/spectral-parsers';
import { createHttpAndFileResolver } from '@stoplight/spectral-ref-resolver';
import { YamlParserResult } from '@stoplight/yaml';
import { memoize } from 'lodash';
import type { Agent } from 'http';
import type * as ProxyAgent from 'proxy-agent';

import { Document, IDocument, IParsedResult, isParsedResult, normalizeSource, ParsedDocument } from './document';
import { DocumentInventory } from './documentInventory';
import { Runner, RunnerRuntime } from './runner';
import { IConstructorOpts, IResolver, IRunOpts, ISpectralDiagnostic, ISpectralFullResult } from './types';
import { ComputeFingerprintFunc, defaultComputeResultFingerprint } from './utils';
import { Ruleset } from './ruleset/ruleset';
import { generateDocumentWideResult } from './utils/generateDocumentWideResult';
import { RulesetDefinition } from './ruleset/types';
import { Format } from './ruleset/format';
import { getDiagnosticSeverity } from './ruleset';

memoize.Cache = WeakMap;

export * from './types';

export class Spectral {
  private readonly _resolver: IResolver;
  private readonly agent: Agent | undefined;

  public ruleset: Ruleset = new Ruleset({ rules: {} });

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

    this.runtime = new RunnerRuntime();
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

      let severity;

      if (diagnostic.message.startsWith('Mapping key must be a string scalar rather than')) {
        severity = getDiagnosticSeverity(this.ruleset.parserOptions.incompatibleValues);
      } else if (diagnostic.message.startsWith('Duplicate key')) {
        severity = getDiagnosticSeverity(this.ruleset.parserOptions.duplicateKeys);
      } else {
        continue;
      }

      if (severity === -1) {
        document.diagnostics.splice(i, 1);
        i--;
      } else {
        diagnostic.severity = severity;
      }
    }

    return document;
  }

  public async runWithResolved(
    target: IParsedResult | IDocument | Record<string, unknown> | string,
    opts: IRunOpts = {},
  ): Promise<ISpectralFullResult> {
    const { ruleset } = this;
    if (!ruleset) {
      throw new Error('no ruleset loaded');
    }

    const document = this.parseDocument(target, opts.resolve?.documentUri);

    if (document.source === null && opts.resolve?.documentUri !== void 0) {
      (document as Omit<Document, 'source'> & { source: string }).source = normalizeSource(opts.resolve.documentUri);
    }

    const inventory = new DocumentInventory(document, this._resolver);
    await inventory.resolve();

    const runner = new Runner(this.runtime, inventory);

    if (document.formats === void 0) {
      const foundFormats = [...ruleset.formats].filter(format => format(inventory.resolved, document.source));
      if (foundFormats.length === 0 && opts.ignoreUnknownFormat !== true) {
        document.formats = null;
        if (ruleset.formats.size > 0) {
          runner.addResult(this._generateUnrecognizedFormatError(document, Array.from(ruleset.formats)));
        }
      } else {
        document.formats = new Set(foundFormats);
      }
    }

    await runner.run(ruleset);
    const results = runner.getResults(this._computeFingerprint);

    return {
      resolved: inventory.resolved,
      results,
    };
  }

  public async run(
    target: IParsedResult | IDocument | Record<string, unknown> | string,
    opts: IRunOpts = {},
  ): Promise<ISpectralDiagnostic[]> {
    return (await this.runWithResolved(target, opts)).results;
  }

  public setRuleset(ruleset: RulesetDefinition | Ruleset): void {
    this.runtime.revoke();
    this.ruleset = ruleset instanceof Ruleset ? ruleset : new Ruleset(ruleset);
  }

  private _generateUnrecognizedFormatError(document: IDocument, formats: Format[]): ISpectralDiagnostic {
    return generateDocumentWideResult(
      document,
      `The provided document does not match any of the registered formats [${formats
        .map(fn => fn.displayName ?? fn.name)
        .join(', ')}]`,
      DiagnosticSeverity.Warning,
      'unrecognized-format',
    );
  }
}
