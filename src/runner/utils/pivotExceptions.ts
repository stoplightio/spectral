import { extractPointerFromRef, extractSourceFromRef, pointerToPath } from '@stoplight/json';
import { Dictionary, JsonPath } from '@stoplight/types';
import { RunRuleCollection } from '../../types';
import { RulesetExceptionCollection } from '../../types/ruleset';
import { InvalidUriError } from '../../ruleset/mergers/exceptions';

export type ExceptionLocation =
  | {
      source: string;
      path: JsonPath;
    }
  | {
      source: string;
      path: null;
    }
  | {
      source: null;
      path: JsonPath;
    };

export const pivotExceptions = (
  exceptions: RulesetExceptionCollection,
  runRules: RunRuleCollection,
): Dictionary<ExceptionLocation[], string> => {
  const dic: Dictionary<ExceptionLocation[], string> = {};

  for (const [location, rules] of Object.entries(exceptions)) {
    const pointer = extractPointerFromRef(location);
    const source = extractSourceFromRef(location);

    if (pointer === null && source === null) {
      throw new InvalidUriError(`Malformed exception key (${location}).`);
    }

    for (const rulename of rules) {
      const rule = runRules[rulename];

      if (rule !== void 0) {
        if (!(rulename in dic)) {
          dic[rulename] = [];
        }

        dic[rulename].push({
          source,
          path: pointer === null ? null : pointerToPath(pointer),
        } as ExceptionLocation);
      }
    }
  }

  return dic;
};
