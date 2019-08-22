import { Dictionary } from '@stoplight/types/dist';
import { FunctionsCollection, RuleCollection } from '../../types';
const nanoid = require('nanoid');

export function mergeFunctions(target: FunctionsCollection, source: FunctionsCollection, rules: RuleCollection) {
  const map: Dictionary<string, string> = {};

  for (const [name, fn] of Object.entries(source)) {
    const newName = nanoid();
    map[name] = newName;
    target[newName] = fn;
    target[name] = fn;
  }

  for (const rule of Object.values(rules)) {
    if (typeof rule === 'object') {
      const ruleThen = Array.isArray(rule.then) ? rule.then : [rule.then];
      for (const then of ruleThen) {
        // note: if function relies on global function, it will take the most recent defined one
        if (then.function in map) {
          then.function = map[then.function];
        }
      }
    }
  }
}
