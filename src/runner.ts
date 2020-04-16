const allSettled = require('promise.allsettled');
const { JSONPath } = require('jsonpath-plus');
import { DiagnosticSeverity, Optional } from '@stoplight/types';
import { flatMap } from 'lodash';
import { STDIN } from './document';
import { DocumentInventory } from './documentInventory';
import { lintNode } from './linter';
import { getDiagnosticSeverity } from './rulesets/severity';
import { FunctionCollection, IRule, IRuleResult, IRunRule, RunRuleCollection } from './types';
import { RulesetExceptionCollection } from './types/ruleset';
import { hasIntersectingElement } from './utils/';
import { generateDocumentWideResult } from './utils/generateDocumentWideResult';
import { IExceptionLocation, pivotExceptions } from './utils/pivotExceptions';

export const isRuleEnabled = (rule: IRule) => rule.severity !== void 0 && getDiagnosticSeverity(rule.severity) !== -1;

const isStdInSource = (inventory: DocumentInventory): boolean => {
  return inventory.document.source === STDIN;
};

export interface IRunningContext {
  documentInventory: DocumentInventory;
  rules: RunRuleCollection;
  functions: FunctionCollection;
  exceptions: RulesetExceptionCollection;
}

const generateDefinedExceptionsButStdIn = (documentInventory: DocumentInventory): IRuleResult => {
  return generateDocumentWideResult(
    documentInventory.document,
    'The ruleset contains `except` entries. However, they cannot be enforced when the input is passed through stdin.',
    DiagnosticSeverity.Warning,
    'except-but-stdin',
  );
};

export const runRules = async (context: IRunningContext): Promise<IRuleResult[]> => {
  const { documentInventory, rules, exceptions } = context;

  const results: Array<IRuleResult | Promise<IRuleResult[]>> = [];
  const isStdIn = isStdInSource(documentInventory);
  const exceptRuleByLocations = isStdIn ? {} : pivotExceptions(exceptions, rules);

  if (isStdIn && Object.keys(exceptions).length > 0) {
    results.push(generateDefinedExceptionsButStdIn(documentInventory));
  }

  for (const rule of Object.values(rules)) {
    if (!isRuleEnabled(rule)) continue;

    if (
      rule.formats !== void 0 &&
      (documentInventory.formats === null ||
        (documentInventory.formats !== void 0 && !hasIntersectingElement(rule.formats, documentInventory.formats)))
    ) {
      continue;
    }

    runRule(context, rule, exceptRuleByLocations[rule.name], results);
  }

  return flatMap<PromiseSettledResult<IRuleResult[]>, IRuleResult>(await allSettled(results), result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      // todo: use @stoplight/reporter
      console.warn(result.reason);
      return [];
    }
  });
};

const runRule = (
  context: IRunningContext,
  rule: IRunRule,
  exceptRuleByLocations: Optional<IExceptionLocation[]>,
  results: Array<IRuleResult | Promise<IRuleResult[]>>,
): void => {
  const target = rule.resolved === false ? context.documentInventory.unresolved : context.documentInventory.resolved;

  for (const given of Array.isArray(rule.given) ? rule.given : [rule.given]) {
    // don't have to spend time running jsonpath if given is $ - can just use the root object
    if (given === '$') {
      results.push(
        lintNode(
          context,
          {
            path: ['$'],
            value: target,
          },
          rule,
          exceptRuleByLocations,
        ),
      );
    } else {
      JSONPath({
        path: given,
        json: target,
        resultType: 'all',
        callback: (result: any) => {
          results.push(
            lintNode(
              context,
              {
                path: JSONPath.toPathArray(result.path),
                value: result.value,
              },
              rule,
              exceptRuleByLocations,
            ),
          );
        },
      });
    }
  }
};
