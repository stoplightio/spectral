import { Optional } from '@stoplight/types';
import { assertValidRule } from '../validation';
import { Rule } from '../rule/rule';
import type { Ruleset } from '../ruleset';
import { FileRuleDefinition } from '../types';

function assertExistingRule(maybeRule: Optional<Rule>): asserts maybeRule is Rule {
  if (maybeRule === void 0) {
    throw new ReferenceError('Cannot extend non-existing rule');
  }
}

/*
- if rule is object, simple deep merge (or we could replace to be a bit stricter?)
- if rule is true, use parent rule with it's default severity
- if rule is false, use parent rule but set it's severity to "off"
- if rule is string or number, use parent rule and set it's severity to the given string/number value
*/
export function mergeRule(
  existingRule: Optional<Rule>,
  name: string,
  rule: FileRuleDefinition,
  ruleset: Ruleset,
): Rule {
  switch (typeof rule) {
    case 'boolean':
      assertExistingRule(existingRule);
      existingRule.enabled = rule;
      break;
    case 'string':
    case 'number':
      assertExistingRule(existingRule);
      existingRule.severity = rule;
      if (rule === 'off') {
        existingRule.enabled = false;
      } else if (!existingRule.enabled) {
        existingRule.enabled = true;
      }
      break;
    case 'object':
      if (existingRule !== void 0) {
        Object.assign(existingRule, rule, { owner: existingRule.owner });
      } else {
        assertValidRule(rule);
        return new Rule(name, rule, ruleset);
      }

      break;
    default:
      throw new Error('Invalid value');
  }

  return existingRule;
}
