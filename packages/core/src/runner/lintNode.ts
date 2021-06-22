import { JsonPath } from '@stoplight/types';
import { decodeSegmentFragment, getClosestJsonPath, printPath, PrintStyle } from '@stoplight/spectral-runtime';
import { get } from 'lodash';

import { Document } from '../document';
import { IFunctionResult, IGivenNode, RulesetFunctionContext } from '../types';
import { IRunnerInternalContext } from './types';
import { getLintTargets, MessageVars, message } from './utils';
import { Rule } from '../ruleset/rule/rule';

export const lintNode = (context: IRunnerInternalContext, node: IGivenNode, rule: Rule): void => {
  const fnContext: RulesetFunctionContext = {
    document: context.documentInventory.document,
    documentInventory: context.documentInventory,
    rule,
    path: [],
  };

  const givenPath = node.path.length > 0 && node.path[0] === '$' ? node.path.slice(1) : node.path;

  for (const then of rule.then) {
    const targets = getLintTargets(node.value, then.field);

    for (const target of targets) {
      const path = target.path.length > 0 ? [...givenPath, ...target.path] : givenPath;

      const targetResults = then.function(target.value, then.functionOptions ?? null, {
        ...fnContext,
        path,
      });

      if (targetResults === void 0) continue;

      if ('then' in targetResults) {
        context.promises.push(
          targetResults.then(results =>
            results === void 0
              ? void 0
              : void processTargetResults(
                  context,
                  results,
                  rule,
                  path, // todo: get rid of it somehow.
                ),
          ),
        );
      } else {
        processTargetResults(
          context,
          targetResults,
          rule,
          path, // todo: get rid of it somehow.
        );
      }
    }
  }
};

function processTargetResults(
  context: IRunnerInternalContext,
  results: IFunctionResult[],
  rule: Rule,
  targetPath: JsonPath,
): void {
  for (const result of results) {
    const escapedJsonPath = (result.path ?? targetPath).map(decodeSegmentFragment);
    const associatedItem = context.documentInventory.findAssociatedItemForPath(escapedJsonPath, rule.resolved);
    const path = associatedItem?.path ?? getClosestJsonPath(context.documentInventory.resolved, escapedJsonPath);
    const source = associatedItem?.document.source;

    const document = associatedItem?.document ?? context.documentInventory.document;
    const range = document.getRangeForJsonPath(path, true) ?? Document.DEFAULT_RANGE;
    const value: unknown = path.length === 0 ? document.data : get(document.data, path);

    const vars: MessageVars = {
      property:
        associatedItem?.missingPropertyPath !== void 0 && associatedItem.missingPropertyPath.length > path.length
          ? printPath(associatedItem.missingPropertyPath.slice(path.length - 1), PrintStyle.Dot)
          : path.length > 0
          ? path[path.length - 1]
          : '',
      error: result.message,
      path: printPath(path, PrintStyle.EscapedPointer),
      description: rule.description,
      value,
    };

    const resultMessage = message(result.message, vars);
    vars.error = resultMessage;

    context.results.push({
      code: rule.name,
      message: (rule.message === null ? rule.description ?? resultMessage : message(rule.message, vars)).trim(),
      path,
      severity: rule.severity,
      ...(source !== null ? { source } : null),
      range,
    });
  }
}
