import { IDocument } from '../document';
import { DocumentInventory } from '../documentInventory';
import { IRuleResult } from '../types';
import { ComputeFingerprintFunc, prepareResults } from '../utils';
import { lintNode } from './lintNode';
import { RunnerRuntime } from './runtime';
import { IRunnerInternalContext } from './types';
import { Ruleset } from '../ruleset/ruleset';
import Nimma, { Callback } from 'nimma/legacy'; // legacy = Node v12, nimma without /legacy supports only 14+
import { jsonPathPlus } from 'nimma/fallbacks';
import { isPlainObject } from '@stoplight/json';
import { isAggregateError } from '../guards/isAggregateError';

export class Runner {
  public readonly results: IRuleResult[];

  constructor(protected readonly runtime: RunnerRuntime, protected readonly inventory: DocumentInventory) {
    this.results = [...this.inventory.diagnostics, ...(this.inventory.errors ?? [])];
  }

  protected get document(): IDocument {
    return this.inventory.document;
  }

  public addResult(result: IRuleResult): void {
    this.results.push(result);
  }

  public async run(ruleset: Ruleset): Promise<void> {
    this.runtime.emit('setup');

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

    if (resolvedJsonPaths.length > 0) {
      execute(runnerContext.documentInventory.resolved, callbacks.resolved, resolvedJsonPaths);
    }

    if (unresolvedJsonPaths.length > 0) {
      execute(runnerContext.documentInventory.unresolved, callbacks.unresolved, unresolvedJsonPaths);
    }

    this.runtime.emit('beforeTeardown');

    try {
      if (runnerContext.promises.length > 0) {
        await Promise.all(runnerContext.promises);
      }
    } finally {
      this.runtime.emit('afterTeardown');
    }
  }

  public getResults(computeFingerprint: ComputeFingerprintFunc): IRuleResult[] {
    return prepareResults(this.results, computeFingerprint);
  }
}

function execute(input: unknown, callbacks: Record<string, Callback[]>, jsonPathExpressions: string[]): void {
  if (!isPlainObject(input) && !Array.isArray(input)) {
    for (const cb of callbacks.$ ?? []) {
      cb({
        path: [],
        value: input,
      });
    }

    return;
  }

  try {
    const nimma = new Nimma(jsonPathExpressions, {
      fallback: jsonPathPlus,
      unsafe: false,
      output: 'auto',
    });

    nimma.query(
      input,
      Object.entries(callbacks).reduce<Record<string, Callback>>((mapped, [key, cbs]) => {
        mapped[key] = scope => {
          for (const cb of cbs) {
            cb(scope);
          }
        };

        return mapped;
      }, {}),
    );
  } catch (e) {
    if (isAggregateError(e) && e.errors.length === 1) {
      throw e.errors[0];
    } else {
      throw e;
    }
  }
}
