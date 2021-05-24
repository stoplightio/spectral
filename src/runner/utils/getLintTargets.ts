import { JsonPath, Optional } from '@stoplight/types';
import { JSONPath } from 'jsonpath-plus';
import { get, isObject, toPath } from 'lodash';

export interface ILintTarget {
  path: JsonPath;
  value: unknown;
}

export const getLintTargets = (targetValue: unknown, field: Optional<string>): ILintTarget[] => {
  const targets: ILintTarget[] = [];

  if (isObject(targetValue) && typeof field === 'string') {
    if (field === '@key') {
      for (const key of Object.keys(targetValue)) {
        targets.push({
          path: [key],
          value: key,
        });
      }
    } else if (field.startsWith('$')) {
      JSONPath({
        path: field,
        json: targetValue,
        resultType: 'all',
        callback(result) {
          targets.push({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            path: JSONPath.toPathArray(result.path).slice(1),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            value: result.value,
          });
        },
      });
    } else {
      // lodash lookup
      targets.push({
        path: toPath(field),
        value: get(targetValue, field),
      });
    }
  } else {
    targets.push({
      path: [],
      value: targetValue,
    });
  }

  if (targets.length === 0) {
    // must call then at least once, with no document
    targets.push({
      path: [],
      value: void 0,
    });
  }

  return targets;
};
