import { JsonPath, Optional } from '@stoplight/types';
import { JSONPath } from 'jsonpath-plus';
import { get, isObject, toPath } from 'lodash';

export interface ILintTarget {
  path: JsonPath;
  value: unknown;
}

const { toPathArray } = JSONPath as typeof JSONPath & {
  toPathArray(path: string): string[];
};

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
            path: toPathArray(result.path).slice(1),
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

  if (!targets.length) {
    // must call then at least once, with no document
    targets.push({
      path: [],
      value: void 0,
    });
  }

  return targets;
};
