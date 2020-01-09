import { decodePointerFragment } from '@stoplight/json';
import { get } from 'lodash';

import { Document } from './document';
import { DocumentInventory } from './documentInventory';
import { IMessageVars, message } from './rulesets/message';
import { getDiagnosticSeverity } from './rulesets/severity';
import { IFunction, IGivenNode, IRuleResult, IRunRule, IThen } from './types';
import { getClosestJsonPath, printPath, PrintStyle } from './utils';

const { JSONPath } = require('jsonpath-plus');

// TODO(SO-23): unit test but mock whatShouldBeLinted
export const lintNode = (
  node: IGivenNode,
  rule: IRunRule,
  then: IThen<string, any>,
  apply: IFunction,
  inventory: DocumentInventory,
): IRuleResult[] => {
  const givenPath = node.path[0] === '$' ? node.path.slice(1) : node.path;
  const targetValue = node.value;

  const targets: any[] = [];
  if (then && then.field) {
    if (then.field === '@key') {
      for (const key of Object.keys(targetValue)) {
        targets.push({
          path: key,
          value: key,
        });
      }
    } else if (then.field[0] === '$') {
      try {
        JSONPath({
          path: then.field,
          json: targetValue,
          resultType: 'all',
          callback: (result: any) => {
            targets.push({
              path: JSONPath.toPathArray(result.path),
              value: result.value,
            });
          },
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      // lodash lookup
      targets.push({
        path: typeof then.field === 'string' ? then.field.split('.') : then.field,
        value: get(targetValue, then.field),
      });
    }
  } else {
    targets.push({
      path: [],
      value: targetValue,
    });
  }

  if (!targets.length) {
    // must call then at least once, with no document
    targets.push({
      path: [],
      value: undefined,
    });
  }

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
          resolved: inventory,
        },
      ) || [];

    results.push(
      ...targetResults.map<IRuleResult>(result => {
        const escapedJsonPath = (result.path || targetPath).map(segment => decodePointerFragment(String(segment)));
        const associatedItem = inventory.findAssociatedItemForPath(escapedJsonPath);
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

  return results;
};
