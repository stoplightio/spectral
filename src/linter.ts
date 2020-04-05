import { decodePointerFragment } from '@stoplight/json';
import { get } from 'lodash';

import { JsonPath, Optional } from '@stoplight/types';
import { Document } from './document';
import { IMessageVars, message } from './rulesets/message';
import { getDiagnosticSeverity } from './rulesets/severity';
import { IRunningContext } from './runner';
import { IGivenNode, IRuleResult, IRunRule } from './types';
import { getClosestJsonPath, getLintTargets, printPath, PrintStyle } from './utils';
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

export const lintNode = async (
  context: IRunningContext,
  node: IGivenNode,
  rule: IRunRule,
  exceptionLocations: Optional<IExceptionLocation[]>,
): Promise<IRuleResult[]> => {
  const results: IRuleResult[] = [];

  for (const then of Array.isArray(rule.then) ? rule.then : [rule.then]) {
    const func = context.functions[then.function];
    if (typeof func !== 'function') {
      throw new ReferenceError(`Function ${then.function} not found. Called by rule ${rule.name}.`);
    }

    const givenPath = node.path[0] === '$' ? node.path.slice(1) : node.path;
    const targets = getLintTargets(node.value, then.field);

    for (const target of targets) {
      const targetPath = [...givenPath, ...target.path];

      const targetResults = await func(
        target.value,
        then.functionOptions,
        {
          given: givenPath,
          target: targetPath,
        },
        {
          original: node.value,
          given: node.value,
          documentInventory: context.documentInventory,
        },
      );

      if (targetResults === void 0) continue;

      for (const result of targetResults) {
        const escapedJsonPath = (result.path || targetPath).map(segment => decodePointerFragment(String(segment)));
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

        results.push({
          code: rule.name,
          message: (rule.message === void 0 ? rule.description ?? resultMessage : message(rule.message, vars)).trim(),
          path,
          severity: getDiagnosticSeverity(rule.severity),
          ...(source !== null && { source }),
          range,
        });
      }
    }
  }

  return results;
};
