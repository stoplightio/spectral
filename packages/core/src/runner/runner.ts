import { DiagnosticSeverity } from '@stoplight/types';
import { Document, IDocument } from '../document';
import { DocumentInventory } from '../documentInventory';
import { IRuleResult } from '../types';
import { prepareResults } from './utils/results';
import { lintNode } from './lintNode';
import { IRunnerInternalContext } from './types';
import { Ruleset } from '../ruleset/ruleset';
import Nimma, { Callback } from 'nimma/legacy'; // legacy = Node v12, nimma without /legacy supports only 14+
import { jsonPathPlus } from 'nimma/fallbacks';
import { isPlainObject } from '@stoplight/json';

export class Runner {
  public readonly results: IRuleResult[];

  constructor(protected readonly inventory: DocumentInventory) {
    this.results = [...this.inventory.diagnostics, ...(this.inventory.errors ?? [])];
  }

  protected get document(): IDocument {
    return this.inventory.document;
  }

  public addResult(result: IRuleResult): void {
    this.results.push(result);
  }

  public async run(ruleset: Ruleset): Promise<void> {
    const { inventory: documentInventory } = this;
    const { rules } = ruleset;
    const formats = this.document.formats ?? null;

    const runnerContext: IRunnerInternalContext = {
      ruleset,
      documentInventory,
      results: this.results,
      promises: [],
    };

    const enabledRules = Object.values(rules).filter(rule => rule.enabled);
    const relevantRules = enabledRules.filter(rule => rule.matchesFormat(documentInventory.formats));
    const callbacks: Record<'resolved' | 'unresolved', Record<string, Callback[]>> = {
      resolved: {},
      unresolved: {},
    };

    for (const rule of relevantRules) {
      for (const given of rule.getGivenForFormats(formats)) {
        const cb: Callback = (scope): void => {
          lintNode(runnerContext, scope, rule);
        };

        (callbacks[rule.resolved ? 'resolved' : 'unresolved'][given] ??= []).push(cb);
      }
    }

    const resolvedJsonPaths = Object.keys(callbacks.resolved);
    const unresolvedJsonPaths = Object.keys(callbacks.unresolved);

    const reportGivenError =
      (resolved: boolean) =>
      (given: string, error: unknown): void => {
        for (const rule of relevantRules) {
          if (rule.resolved !== resolved || !rule.getGivenForFormats(formats).includes(given)) continue;

          this.addResult({
            code: rule.name,
            message: `Rule "${rule.name}" could not be applied, "given" expression ${given} threw an exception: ${
              error instanceof Error ? error.message : String(error)
            }. Make sure the expression handles null values, i.e. $..[?(@ && @.foo)]`,
            path: [],
            severity: DiagnosticSeverity.Error,
            range: Document.DEFAULT_RANGE,
            ...(this.document.source !== null ? { source: this.document.source } : null),
          });
        }
      };

    if (resolvedJsonPaths.length > 0) {
      execute(runnerContext.documentInventory.resolved, callbacks.resolved, resolvedJsonPaths, reportGivenError(true));
    }

    if (unresolvedJsonPaths.length > 0) {
      execute(
        runnerContext.documentInventory.unresolved,
        callbacks.unresolved,
        unresolvedJsonPaths,
        reportGivenError(false),
      );
    }

    if (runnerContext.promises.length > 0) {
      await Promise.all(runnerContext.promises);
    }
  }

  public getResults(): IRuleResult[] {
    return prepareResults(this.results);
  }
}

type GivenScope = Parameters<Callback>[0];

function query(input: Parameters<Nimma['query']>[0], jsonPathExpressions: string[]): Array<[string, GivenScope]> {
  const nimma = new Nimma(jsonPathExpressions, {
    fallback: jsonPathPlus,
    unsafe: false,
    output: 'auto',
    customShorthands: {},
  });
  const matches: Array<[string, GivenScope]> = [];
  nimma.query(
    input,
    Object.fromEntries(
      jsonPathExpressions.map(expression => [
        expression,
        (scope: GivenScope): void => {
          // the scope object is reused by nimma, hence the snapshot
          matches.push([expression, { path: [...scope.path], value: scope.value }]);
        },
      ]),
    ),
  );

  return matches;
}

function execute(
  input: unknown,
  callbacks: Record<string, Callback[]>,
  jsonPathExpressions: string[],
  onGivenError: (given: string, error: unknown) => void,
): void {
  if (!isPlainObject(input) && !Array.isArray(input)) {
    for (const cb of callbacks.$ ?? []) {
      cb({
        path: [],
        value: input,
      });
    }

    return;
  }

  let matches: Array<[string, GivenScope]>;

  try {
    matches = query(input, jsonPathExpressions);
  } catch (e) {
    if (!(e instanceof TypeError)) throw e;
    matches = [];
    for (const expression of jsonPathExpressions) {
      try {
        matches.push(...query(input, [expression]));
      } catch (err) {
        if (!(err instanceof TypeError)) throw err;
        onGivenError(expression, err);
      }
    }
  }
  for (const [expression, scope] of matches) {
    for (const cb of callbacks[expression]) {
      cb(scope);
    }
  }
}
