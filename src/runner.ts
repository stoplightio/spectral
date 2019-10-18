const { JSONPath } = require('jsonpath-plus');
import { DiagnosticSeverity } from '@stoplight/types';

import { STDIN } from './document';
import { DocumentInventory } from './documentInventory';
import { lintNode } from './linter';
import { getDiagnosticSeverity } from './rulesets/severity';
import { FunctionCollection, IGivenNode, IRule, IRuleResult, IRunRule, RunRuleCollection } from './types';
import { RulesetExceptionCollection } from './types/ruleset';
import { hasIntersectingElement } from './utils/';
import { generateDocumentWideResult } from './utils/generateDocumentWideResult';
import { IExceptionLocation, pivotExceptions } from './utils/pivotExceptions';

export const isRuleEnabled = (rule: IRule) => rule.severity !== void 0 && getDiagnosticSeverity(rule.severity) !== -1;

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

export const runRules = async (
  documentInventory: DocumentInventory,
  rules: RunRuleCollection,
  functions: FunctionCollection,
  exceptions: RulesetExceptionCollection,
): Promise<IRuleResult[]> => {
  const results: IRuleResult[] = [];

  const isStdIn = isStdInSource(documentInventory);

  if (isStdIn && Object.keys(exceptions).length > 0) {
    results.push(generateDefinedExceptionsButStdIn(documentInventory));
  }

  const exceptRuleByLocations = isStdIn ? {} : pivotExceptions(exceptions, rules);

  for (const name in rules) {
    if (!rules.hasOwnProperty(name)) continue;

    const rule = rules[name];
    if (!rule) continue;

    if (
      rule.formats !== void 0 &&
      (documentInventory.formats === null ||
        (documentInventory.formats !== void 0 && !hasIntersectingElement(rule.formats, documentInventory.formats)))
    ) {
      continue;
    }

    if (!isRuleEnabled(rule)) {
      continue;
    }

    let ruleResults: IRuleResult[] = [];

    try {
      ruleResults = await runRule(documentInventory, rule, functions, exceptRuleByLocations[name]);
    } catch (e) {
      console.error(`Unable to run rule '${name}':\n${e}`);
    }

    results.push(...ruleResults);
  }

  return results;
};

const runRule = async (
  resolved: DocumentInventory,
  rule: IRunRule,
  functions: FunctionCollection,
  exceptionLocations: IExceptionLocation[] | undefined,
): Promise<IRuleResult[]> => {
  const target = rule.resolved === false ? resolved.unresolved : resolved.resolved;

  const results: IRuleResult[] = [];
  const promises: Array<Promise<void>> = [];

  for (const given of Array.isArray(rule.given) ? rule.given : [rule.given]) {
    // don't have to spend time running jsonpath if given is $ - can just use the root object
    if (given === '$') {
      promises.push(
        lint(
          {
            path: ['$'],
            value: target,
          },
          resolved,
          rule,
          functions,
          exceptionLocations,
          results,
        ),
      );
    } else {
      JSONPath({
        path: given,
        json: target,
        resultType: 'all',
        callback: (result: any) => {
          promises.push(
            lint(
              {
                path: JSONPath.toPathArray(result.path),
                value: result.value,
              },
              resolved,
              rule,
              functions,
              exceptionLocations,
              results,
            ),
          );
        },
      });
    }
  }

  await Promise.all(promises);
  return results;
};

async function lint(
  node: IGivenNode,
  resolved: DocumentInventory,
  rule: IRunRule,
  functions: FunctionCollection,
  exceptionLocations: IExceptionLocation[] | undefined,
  results: IRuleResult[],
): Promise<void> {
  try {
    for (const then of Array.isArray(rule.then) ? rule.then : [rule.then]) {
      const func = functions[then.function];
      if (!func) {
        console.warn(`Function ${then.function} not found. Called by rule ${rule.name}.`);
        continue;
      }

      const validationResults = await lintNode(node, rule, then, func, resolved, exceptionLocations);

      if (validationResults.length > 0) {
        results.push(...validationResults);
      }
    }
  } catch (e) {
    console.warn(`Encountered error when running rule '${rule.name}' on node at path '${node.path}':\n${e}`);
  }
}
