import { DiagnosticSeverity, Optional } from '@stoplight/types';
import { JSONPathCallback } from 'jsonpath-plus';
import { STDIN } from '../document';
import { DocumentInventory } from '../documentInventory';
import { Rule } from '../rule';
import { IRuleResult } from '../types';
import { generateDocumentWideResult } from '../utils/generateDocumentWideResult';
import { lintNode } from './lintNode';
import { RunnerRuntime } from './runtime';
import { IRunnerInternalContext, IRunnerPublicContext } from './types';
import { ComputeFingerprintFunc, IExceptionLocation, pivotExceptions, prepareResults } from './utils';

const { JSONPath } = require('jsonpath-plus');

const isStdInSource = (inventory: DocumentInventory): boolean => {
  return inventory.document.source === STDIN;
};

const generateDefinedExceptionsButStdIn = (documentInventory: DocumentInventory): IRuleResult => {
  return generateDocumentWideResult(
    documentInventory.document,
    'The ruleset contains `except` entries. However, they cannot be enforced when the input is passed through stdin.',
    DiagnosticSeverity.Warning,
    'except-but-stdin',
  );
};

const runRule = (
  context: IRunnerInternalContext,
  rule: Rule,
  exceptRuleByLocations: Optional<IExceptionLocation[]>,
): void => {
  const target = rule.resolved ? context.documentInventory.resolved : context.documentInventory.unresolved;

  for (const given of rule.given) {
    // don't have to spend time running jsonpath if given is $ - can just use the root object
    if (given === '$') {
      lintNode(
        context,
        {
          path: ['$'],
          value: target,
        },
        rule,
        exceptRuleByLocations,
      );
    } else {
      JSONPath({
        path: given,
        json: target,
        resultType: 'all',
        callback: (result => {
          lintNode(
            context,
            {
              path: JSONPath.toPathArray(result.path),
              value: result.value,
            },
            rule,
            exceptRuleByLocations,
          );
        }) as JSONPathCallback,
      });
    }
  }
};

export class Runner {
  public readonly results: IRuleResult[];

  constructor(protected readonly runtime: RunnerRuntime, protected readonly inventory: DocumentInventory) {
    this.results = [...this.inventory.diagnostics, ...this.document.diagnostics, ...this.inventory.errors];
  }

  protected get document() {
    return this.inventory.document;
  }

  public addResult(result: IRuleResult) {
    this.results.push(result);
  }

  public async run(context: IRunnerPublicContext): Promise<void> {
    const { inventory: documentInventory } = this;

    const { rules, exceptions } = context;

    const runnerContext: IRunnerInternalContext = {
      ...context,
      documentInventory,
      results: this.results,
      promises: [],
    };

    const isStdIn = isStdInSource(documentInventory);
    const exceptRuleByLocations = isStdIn ? {} : pivotExceptions(exceptions, rules);

    if (isStdIn && Object.keys(exceptions).length > 0) {
      runnerContext.results.push(generateDefinedExceptionsButStdIn(documentInventory));
    }

    const relevantRules = Object.values(rules).filter(
      rule => rule.enabled && rule.matchesFormat(documentInventory.formats),
    );

    for (const rule of relevantRules) {
      try {
        runRule(runnerContext, rule, exceptRuleByLocations[rule.name]);
      } catch (ex) {
        console.error(ex);
      }
    }

    this.runtime.emit('beforeTeardown');

    if (runnerContext.promises.length > 0) {
      await Promise.all(runnerContext.promises);
    }

    this.runtime.emit('afterTeardown');
  }

  public getResults(computeFingerprint: ComputeFingerprintFunc) {
    return prepareResults(this.results, computeFingerprint);
  }
}
