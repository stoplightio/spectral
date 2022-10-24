import { IDocument } from '../document';
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

    if (resolvedJsonPaths.length > 0) {
      execute(runnerContext.documentInventory.resolved, callbacks.resolved, resolvedJsonPaths);
    }

    if (unresolvedJsonPaths.length > 0) {
      execute(runnerContext.documentInventory.unresolved, callbacks.unresolved, unresolvedJsonPaths);
    }

    if (runnerContext.promises.length > 0) {
      await Promise.all(runnerContext.promises);
    }
  }

  public getResults(): IRuleResult[] {
    return prepareResults(this.results);
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

  const nimma = new Nimma(jsonPathExpressions, {
    fallback: jsonPathPlus,
    unsafe: false,
    output: 'auto',
    customShorthands: {},
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
}
