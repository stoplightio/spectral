import { get } from 'lodash';

import { JsonPath, Optional } from '@stoplight/types';
import { Document } from '../document';
import { IMessageVars, message } from '../rulesets/message';
import { getDiagnosticSeverity } from '../rulesets/severity';
import { IFunctionResult, IGivenNode } from '../types';
import { decodeSegmentFragment, getClosestJsonPath, printPath, PrintStyle } from '../utils';
import { Rule } from '../rule';
import { IRunnerInternalContext } from './types';
import { getLintTargets } from './utils/getLintTargets';
import { IExceptionLocation } from './utils/pivotExceptions';

const arePathsEqual = (one: JsonPath, another: JsonPath): boolean => {
  if (one.length !== another.length) {
    return false;
  }

  for (let i = 0; i < one.length; i++) {
    if (one[i] !== another[i]) {
      return false;
    }
  }

  return true;
};

const isAKnownException = (
  path: JsonPath,
  source: Optional<string | null>,
  locations: IExceptionLocation[],
): boolean => {
  for (const location of locations) {
    if (source !== location.source) {
      continue;
    }

    if (arePathsEqual(path, location.path)) {
      return true;
    }
  }

  return false;
};

export const lintNode = (
  context: IRunnerInternalContext,
  node: IGivenNode,
  rule: Rule,
  exceptionLocations: Optional<IExceptionLocation[]>,
): void => {
  const fnContext = {
    original: node.value,
    given: node.value,
    documentInventory: context.documentInventory,
  };

  const givenPath = node.path.length > 0 && node.path[0] === '$' ? node.path.slice(1) : node.path;

  for (const then of rule.then) {
    const func = context.functions[then.function];
    if (typeof func !== 'function') {
      console.warn(`Function ${then.function} not found. Called by rule ${rule.name}.`);
      continue;
    }

    const targets = getLintTargets(node.value, then.field);

    for (const target of targets) {
      const targetPath = target.path.length > 0 ? [...givenPath, ...target.path] : givenPath;

      let targetResults;
      try {
        targetResults = func(
          target.value,
          then.functionOptions,
          {
            given: givenPath,
            target: targetPath,
          },
          fnContext,
        );
      } catch (ex) {
        // todo: use reporter or sth
        console.warn(ex);
      }

      if (targetResults === void 0) continue;

      if ('then' in targetResults) {
        context.promises.push(
          targetResults
            .then(results =>
              results === void 0
                ? void 0
                : void processTargetResults(
                    context,
                    results,
                    rule,
                    exceptionLocations,
                    targetPath, // todo: get rid of it somehow.
                  ),
            )
            .catch(ex => {
              // todo: use reporter or sth
              console.warn(ex.message);
            }),
        );
      } else {
        processTargetResults(
          context,
          targetResults,
          rule,
          exceptionLocations,
          targetPath, // todo: get rid of it somehow.
        );
      }
    }
  }
};

function processTargetResults(
  context: IRunnerInternalContext,
  results: IFunctionResult[],
  rule: Rule,
  exceptionLocations: Optional<IExceptionLocation[]>,
  targetPath: JsonPath,
): void {
  for (const result of results) {
    const escapedJsonPath = (result.path || targetPath).map(decodeSegmentFragment);
    const associatedItem = context.documentInventory.findAssociatedItemForPath(
      escapedJsonPath,
      rule.resolved !== false,
    );
    const path = associatedItem?.path || getClosestJsonPath(context.documentInventory.resolved, escapedJsonPath);
    const source = associatedItem?.document.source;

    if (exceptionLocations !== void 0 && isAKnownException(path, source, exceptionLocations)) {
      continue;
    }

    const document = associatedItem?.document || context.documentInventory.document;
    const range = document.getRangeForJsonPath(path, true) || Document.DEFAULT_RANGE;
    const value = path.length === 0 ? document.data : get(document.data, path);

    const vars: IMessageVars = {
      property:
        associatedItem?.missingPropertyPath && associatedItem.missingPropertyPath.length > path.length
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
      // todo: rule.isInterpolable
      message: (rule.message === null ? rule.description ?? resultMessage : message(rule.message, vars)).trim(),
      path,
      severity: getDiagnosticSeverity(rule.severity),
      ...(source !== null && { source }),
      range,
    });
  }
}
