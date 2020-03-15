import { Dictionary } from '@stoplight/types/dist';
import { RuleCollection } from '../../types';
import { RulesetFunctionCollection } from '../../types/ruleset';
const nanoid = require('nanoid/non-secure');

export function mergeFunctions(
  target: RulesetFunctionCollection,
  source: RulesetFunctionCollection,
  rules: RuleCollection,
) {
  const map: Dictionary<string, string> = {};

  for (const [name, def] of Object.entries(source)) {
    const newName = nanoid();
    map[name] = newName;
    target[newName] = def;
    target[name] = {
      name: def.name,
      schema: def.schema,
      ref: newName,
      source: def.source,
    };
  }

  for (const rule of Object.values(rules)) {
    if (typeof rule === 'object') {
      const ruleThen = Array.isArray(rule.then) ? rule.then : [rule.then];
      for (const then of ruleThen) {
        // if function relies on global function, it will take the most recently defined one
        if (then.function in map) {
          then.function = map[then.function];
        }
      }
    }
  }
}
