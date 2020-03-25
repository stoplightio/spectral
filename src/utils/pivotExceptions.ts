import { extractPointerFromRef, extractSourceFromRef, pointerToPath } from '@stoplight/json';
import { Dictionary, JsonPath } from '@stoplight/types';
import { InvalidUriError } from '../rulesets/mergers/exceptions';
import { IRunRule } from '../types';
import { RulesetExceptionCollection } from '../types/ruleset';

export interface IExceptionLocation {
  source: string;
  path: JsonPath;
}

export const pivotExceptions = (
  exceptions: RulesetExceptionCollection,
  runRules: Dictionary<IRunRule, string>,
): Dictionary<IExceptionLocation[], string> => {
  const dic: Dictionary<IExceptionLocation[], string> = {};

  Object.entries(exceptions).forEach(([location, rules]) => {
    const pointer = extractPointerFromRef(location);
    const source = extractSourceFromRef(location);

    if (pointer === null || source === null) {
      throw new InvalidUriError(`Malformed exception key (${location}).`);
    }

    rules.forEach(rulename => {
      const rule = runRules[rulename];

      if (rule !== undefined) {
        if (!(rulename in dic)) {
          dic[rulename] = [];
        }

        dic[rulename].push({ source, path: pointerToPath(pointer) });
      }
    });
  });

  return dic;
};
