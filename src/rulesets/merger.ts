import { cloneDeep, merge } from 'lodash';
import { Rule } from '../types';
import { FileRule, FileRuleCollection, IRulesetFile } from '../types/ruleset';

/*
- if rule is object, simple deep merge (or we could replace to be a bit stricter?)
- if rule is true, use parent rule with it's default severity
- if rule is false, use parent rule but set it's severity to "off"
- if rule is string or number, use parent rule and set it's severity to the given string/number value
- if rule is array, index 0 should be false/true/string/number - same severity logic as above. optional second
*/
export function mergeConfigs(target: IRulesetFile, src: IRulesetFile) {
  const { rules } = target;

  for (const [name, rule] of Object.entries(src.rules)) {
    processRule(rules, name, rule);
  }
}

const ROOT_DESCRIPTOR = Symbol('root-descriptor');

function markRule(rule: Rule) {
  if (!(ROOT_DESCRIPTOR in rule)) {
    Object.defineProperty(rule, ROOT_DESCRIPTOR, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: copyRule(rule),
    });
  }
}

function getRootRule(rule: Rule): Rule {
  return rule[ROOT_DESCRIPTOR];
}

function updateRootRule(root: Rule, newRule: Rule) {
  root[ROOT_DESCRIPTOR] = copyRule(merge(root, newRule));
}

function copyRule(rule: Rule) {
  return cloneDeep(rule);
}

function processRule(rules: FileRuleCollection, name: string, rule: FileRule) {
  const existingRule = rules[name];

  switch (typeof rule) {
    case 'boolean': {
      // what if rule does not exist (yet)? throw, store the invalid state somehow?
      if (isValidRule(existingRule)) {
        existingRule.severity = !rule ? 'off' : getRootRule(existingRule).severity;
      }

      break;
    }
    case 'string':
    case 'number':
      // what if rule does not exist (yet)? throw, store the invalid state somehow?
      if (isValidRule(existingRule)) {
        existingRule.severity = rule;
      }

      break;
    case 'object':
      if (Array.isArray(rule)) {
        processRule(rules, name, rule[0]);
      } else if (isValidRule(existingRule)) {
        updateRootRule(existingRule, rule);
      } else if (rule !== null) {
        // new rule
        markRule(rule);
        rules[name] = rule;
      }

      break;
    default:
      throw new Error('Invalid value for a rule');
  }
}

function isValidRule(rule: FileRule): rule is Rule {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && 'given' in rule;
}
