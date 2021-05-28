import { DiagnosticSeverity, Optional } from '@stoplight/types';
import { JSONPath, JSONPathCallback } from 'jsonpath-plus';
import { flatMap, isObject } from 'lodash';
import { JSONPathExpression, traverse } from 'nimma';

import { IDocument, STDIN } from '../document';
import { DocumentInventory } from '../documentInventory';
import { OptimizedRule, Rule } from '../rule';
import { IGivenNode, IRuleResult } from '../types';
import { ComputeFingerprintFunc, prepareResults } from '../utils';
import { generateDocumentWideResult } from '../utils/generateDocumentWideResult';
import { lintNode } from './lintNode';
import { RunnerRuntime } from './runtime';
import { IRunnerInternalContext, IRunnerPublicContext } from './types';
import { ExceptionLocation, pivotExceptions } from './utils';

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
  exceptRuleByLocations: Optional<ExceptionLocation[]>,
): void => {
  const target = rule.resolved ? context.documentInventory.resolved : context.documentInventory.unresolved;

  if (!isObject(target)) {
    return;
  }

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
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
              path: JSONPath.toPathArray(result.path),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    this.results = [...this.inventory.diagnostics, ...this.document.diagnostics, ...(this.inventory.errors ?? [])];
  }

  protected get document(): IDocument {
    return this.inventory.document;
  }

  public addResult(result: IRuleResult): void {
    this.results.push(result);
  }

  public async run(context: IRunnerPublicContext): Promise<void> {
    this.runtime.emit('setup');

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

    const optimizedRules: OptimizedRule[] = [];
    const optimizedUnresolvedRules: OptimizedRule[] = [];
    const unoptimizedRules: Rule[] = [];

    const traverseCb = (rule: OptimizedRule, node: IGivenNode): void => {
      lintNode(runnerContext, node, rule, exceptRuleByLocations[rule.name]);
    };

    for (const rule of relevantRules) {
      if (!(rule instanceof OptimizedRule)) {
        unoptimizedRules.push(rule);
        continue;
      }

      if (rule.resolved) {
        optimizedRules.push(rule);
      } else {
        optimizedUnresolvedRules.push(rule);
      }

      rule.hookup(traverseCb);
    }

    if (optimizedRules.length > 0) {
      traverse(Object(runnerContext.documentInventory.resolved), flatMap(optimizedRules, pickExpressions));
    }

    if (optimizedUnresolvedRules.length > 0) {
      traverse(Object(runnerContext.documentInventory.unresolved), flatMap(optimizedUnresolvedRules, pickExpressions));
    }

    for (const rule of unoptimizedRules) {
      runRule(runnerContext, rule, exceptRuleByLocations[rule.name]);
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

function pickExpressions({ expressions }: OptimizedRule): JSONPathExpression[] {
  return expressions;
}
