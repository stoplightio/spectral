import { decodeSegmentFragment, getClosestJsonPath, printPath, PrintStyle } from '@stoplight/spectral-runtime';
import { get, isError } from 'lodash';
import { ErrorWithCause } from 'pony-cause';

import { Document } from '../document';
import type { IFunctionResult, IGivenNode, RulesetFunctionContext } from '../types';
import type { IRunnerInternalContext } from './types';
import { getLintTargets, MessageVars, message } from './utils';
import type { Rule } from '../ruleset/rule';

export const lintNode = (context: IRunnerInternalContext, node: IGivenNode, rule: Rule): void => {
  const givenPath = node.path.length > 0 && node.path[0] === '$' ? node.path.slice(1) : node.path.slice();

  const fnContext: RulesetFunctionContext & { rule: Rule } = {
    document: context.documentInventory.document,
    documentInventory: context.documentInventory,
    rule,
    path: givenPath,
  };

  for (const then of rule.then) {
    const targets = getLintTargets(node.value, then.field);

    for (const target of targets) {
      if (target.path.length > 0) {
        fnContext.path = [...givenPath, ...target.path];
      } else {
        fnContext.path = givenPath;
      }

      let targetResults;
      try {
        targetResults = then.function(target.value, then.functionOptions ?? null, fnContext);
      } catch (e) {
        throw new ErrorWithCause(
          `Function "${then.function.name}" threw an exception${isError(e) ? `: ${e.message}` : ''}`,
          {
            cause: e,
          },
        );
      }

      if (targetResults === void 0) continue;

      if ('then' in targetResults) {
        const _fnContext = { ...fnContext };
        context.promises.push(
          targetResults.then(results =>
            results === void 0 ? void 0 : processTargetResults(context, _fnContext, results),
          ),
        );
      } else {
        processTargetResults(context, fnContext, targetResults);
      }
    }
  }
};

function processTargetResults(
  context: IRunnerInternalContext,
  fnContext: RulesetFunctionContext & { rule: Rule },
  results: IFunctionResult[],
): void {
  const { rule, path: targetPath } = fnContext;
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

    const severity = source !== null && source !== void 0 ? rule.getSeverityForSource(source, path) : rule.severity;

    if (severity === -1) continue;

    context.results.push({
      code: rule.name,
      message: (rule.message === null ? rule.description ?? resultMessage : message(rule.message, vars)).trim(),
      path,
      severity,
      ...(source !== null ? { source } : null),
      range,
    });
  }
}
