import { stringify } from '@stoplight/json';
import { DiagnosticSeverity } from '@stoplight/types';
import * as Parsers from '@stoplight/spectral-parsers';
import { createHttpAndFileResolver, Resolver } from '@stoplight/spectral-ref-resolver';
import { memoize } from 'lodash';

import { Document, IDocument, IParsedResult, isParsedResult, ParsedDocument } from './document';
import { DocumentInventory } from './documentInventory';
import { Runner, RunnerRuntime } from './runner';
import { IConstructorOpts, IRunOpts, ISpectralDiagnostic, ISpectralFullResult } from './types';
import { ComputeFingerprintFunc, defaultComputeResultFingerprint } from './utils';
import { Ruleset } from './ruleset/ruleset';
import { generateDocumentWideResult } from './utils/generateDocumentWideResult';
import { ParserOptions, RulesetDefinition } from './ruleset/types';
import { Format } from './ruleset/format';
import { getDiagnosticSeverity } from './ruleset';

memoize.Cache = WeakMap;

export * from './types';

export class Spectral {
  private readonly _resolver: Resolver;

  public ruleset: Ruleset = new Ruleset({ rules: {} });

  protected readonly runtime: RunnerRuntime;

  private readonly _computeFingerprint: ComputeFingerprintFunc;

  constructor(protected readonly opts?: IConstructorOpts) {
    this._computeFingerprint = memoize(defaultComputeResultFingerprint);

    if (opts?.resolver !== void 0) {
      this._resolver = opts.resolver;
    } else {
      this._resolver = createHttpAndFileResolver();
    }

    this.runtime = new RunnerRuntime();
  }

  protected parseDocument(target: IParsedResult | IDocument | Record<string, unknown> | string): IDocument {
    return target instanceof Document
      ? target
      : isParsedResult(target)
      ? new ParsedDocument(target)
      : new Document<unknown, Parsers.YamlParserResult<unknown>>(
          typeof target === 'string' ? target : stringify(target, void 0, 2),
          Parsers.Yaml,
        );
  }

  public async runWithResolved(
    target: IParsedResult | IDocument | Record<string, unknown> | string,
    opts: IRunOpts = {},
  ): Promise<ISpectralFullResult> {
    const document = this.parseDocument(target);
    const ruleset = this.ruleset.fromSource(document.source);

    const inventory = new DocumentInventory(document, this._resolver);
    await inventory.resolve();

    const runner = new Runner(this.runtime, inventory);
    runner.results.push(...this._filterParserErrors(document.diagnostics, ruleset.parserOptions));

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

  private _filterParserErrors(
    diagnostics: ReadonlyArray<ISpectralDiagnostic>,
    parserOptions: ParserOptions,
  ): ISpectralDiagnostic[] {
    return diagnostics.reduce<ISpectralDiagnostic[]>((diagnostics, diagnostic) => {
      if (diagnostic.code !== 'parser') return diagnostics;

      let severity;

      if (diagnostic.message.startsWith('Mapping key must be a string scalar rather than')) {
        severity = getDiagnosticSeverity(parserOptions.incompatibleValues);
      } else if (diagnostic.message.startsWith('Duplicate key')) {
        severity = getDiagnosticSeverity(parserOptions.duplicateKeys);
      } else {
        diagnostics.push(diagnostic);
        return diagnostics;
      }

      if (severity !== -1) {
        diagnostics.push(diagnostic);
        diagnostic.severity = severity;
      }

      return diagnostics;
    }, []);
  }
}
