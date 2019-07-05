import { DiagnosticSeverity } from '@stoplight/types/dist';
import { cloneDeep } from 'lodash';
import { HumanReadableDiagnosticSeverity, Rule } from '../types';
import { FileRule, FileRuleCollection, FileRulesetSeverity, IRulesetFile } from '../types/ruleset';

const DEFAULT_SEVERITY_LEVEL = DiagnosticSeverity.Warning;

/*
- if rule is object, simple deep merge (or we could replace to be a bit stricter?)
- if rule is true, use parent rule with it's default severity
- if rule is false, use parent rule but set it's severity to "off"
- if rule is string or number, use parent rule and set it's severity to the given string/number value
- if rule is array, index 0 should be false/true/string/number - same severity logic as above. optional second
*/
export function mergeRulesets(target: IRulesetFile, src: IRulesetFile, rulesetSeverity?: FileRulesetSeverity) {
  const { rules } = target;

  for (const [name, rule] of Object.entries(src.rules)) {
    if (rulesetSeverity !== undefined) {
      if (isValidRule(rule)) {
        processRule(rules, name, { ...rule, severity: getSeverityLevel(src.rules, name, rulesetSeverity) });
      } else {
        processRule(rules, name, rulesetSeverity);
      }
    } else {
      processRule(rules, name, rule);
    }
  }

  return target;
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

function updateRootRule(root: Rule, newRule: Rule | null) {
  markRule(root);
  Object.assign(root[ROOT_DESCRIPTOR], copyRule(newRule === null ? root : Object.assign(root, newRule)));
}

function copyRule(rule: Rule) {
  return cloneDeep(rule);
}

function processRule(rules: FileRuleCollection, name: string, rule: FileRule | FileRulesetSeverity) {
  const existingRule = rules[name];

  switch (typeof rule) {
    case 'boolean':
    case 'string':
    case 'number':
      // what if rule does not exist (yet)? throw, store the invalid state somehow?
      if (isValidRule(existingRule)) {
        existingRule.severity = getSeverityLevel(rules, name, rule);
      }

      break;
    case 'object':
      if (Array.isArray(rule)) {
        processRule(rules, name, rule[0]);

        if (isValidRule(existingRule) && rule.length === 2 && rule[1] !== undefined) {
          if ('functionOptions' in existingRule.then) {
            existingRule.then.functionOptions = rule[1];
          }

          updateRootRule(existingRule, null);
        }
      } else if (isValidRule(existingRule)) {
        updateRootRule(existingRule, rule);
      } else {
        // new rule
        markRule(rule);
        rules[name] = rule;
        if (rule.severity === undefined) {
          rule.severity = DEFAULT_SEVERITY_LEVEL;
        }
      }

      break;
    default:
      throw new Error('Invalid value for a rule');
  }
}

function isValidRule(rule: FileRule): rule is Rule {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}

function getSeverityLevel(
  rules: FileRuleCollection,
  name: string,
  rule: FileRule | FileRulesetSeverity,
): DiagnosticSeverity | HumanReadableDiagnosticSeverity {
  const existingRule = rules[name];

  if (!isValidRule(existingRule)) return 'off';

  const existingSeverity = existingRule.severity !== undefined ? existingRule.severity : DEFAULT_SEVERITY_LEVEL;

  if (rule === 'recommended') {
    return existingRule.recommended ? existingSeverity : 'off';
  }

  if (rule === 'all') {
    return existingSeverity;
  }

  switch (typeof rule) {
    case 'number':
    case 'string':
      return rule;
    case 'boolean':
      return rule ? existingSeverity : 'off';
    default:
      return 'off';
  }
}
