import { decodePointerFragment } from '@stoplight/json';
import { get } from 'lodash';

import { JsonPath } from '@stoplight/types';
import { Document } from './document';
import { DocumentInventory } from './documentInventory';
import { IMessageVars, message } from './rulesets/message';
import { getDiagnosticSeverity } from './rulesets/severity';
import { IFunction, IGivenNode, IRuleResult, IRunRule, IThen } from './types';
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

const isAKnownException = (violation: IRuleResult, locations: IExceptionLocation[]): boolean => {
  for (const location of locations) {
    if (violation.source !== location.source) {
      continue;
    }

    if (arePathsEqual(violation.path, location.path)) {
      return true;
    }
  }

  return false;
};

// TODO(SO-23): unit test but mock whatShouldBeLinted
export const lintNode = (
  node: IGivenNode,
  rule: IRunRule,
  then: IThen<string, any>,
  apply: IFunction,
  inventory: DocumentInventory,
  exceptionLocations: IExceptionLocation[] | undefined,
): IRuleResult[] => {
  const givenPath = node.path[0] === '$' ? node.path.slice(1) : node.path;
  const targets = getLintTargets(node.value, then.field);
  const results: IRuleResult[] = [];

  for (const target of targets) {
    const targetPath = givenPath.concat(target.path);

    const targetResults =
      apply(
        target.value,
        then.functionOptions || {},
        {
          given: givenPath,
          target: targetPath,
        },
        {
          original: node.value,
          given: node.value,
          documentInventory: inventory,
        },
      ) || [];

    results.push(
      ...targetResults.map<IRuleResult>(result => {
        const escapedJsonPath = (result.path || targetPath).map(segment => decodePointerFragment(String(segment)));
        const associatedItem = inventory.findAssociatedItemForPath(escapedJsonPath, rule.resolved !== false);
        const path = associatedItem?.path || getClosestJsonPath(inventory.resolved, escapedJsonPath);
        const document = associatedItem?.document || inventory.document;
        const range = document.getRangeForJsonPath(path, true) || Document.DEFAULT_RANGE;
        const value = path.length === 0 ? document.data : get(document.data, path);
        const source = associatedItem?.document.source;

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

        return {
          code: rule.name,
          message: (rule.message === void 0 ? rule.description ?? resultMessage : message(rule.message, vars)).trim(),
          path,
          severity: getDiagnosticSeverity(rule.severity),
          ...(source !== null && { source }),
          range,
        };
      }),
    );
  }

  if (exceptionLocations === undefined) {
    return results;
  }

  const filtered = results.filter(r => !isAKnownException(r, exceptionLocations));
  return filtered;
};
