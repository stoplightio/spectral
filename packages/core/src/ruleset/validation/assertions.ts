import { isPlainObject } from '@stoplight/json';
import { createValidator } from './ajv';
import { RulesetAjvValidationError, RulesetValidationError } from './errors';
import type { FileRuleDefinition, RuleDefinition, RulesetDefinition } from '../types';

export function assertValidRuleset(
  ruleset: unknown,
  format: 'js' | 'json' = 'js',
): asserts ruleset is RulesetDefinition {
  if (!isPlainObject(ruleset)) {
    throw new Error('Provided ruleset is not an object');
  }

  if (!('rules' in ruleset) && !('extends' in ruleset) && !('overrides' in ruleset)) {
    throw new RulesetValidationError('Ruleset must have rules or extends or overrides defined');
  }

  const validate = createValidator(format);

  if (!validate(ruleset)) {
    throw new RulesetAjvValidationError(ruleset, validate.errors ?? []);
  }
}

export function isValidRule(rule: FileRuleDefinition): rule is RuleDefinition {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}

export function assertValidRule(rule: FileRuleDefinition): asserts rule is RuleDefinition {
  if (!isValidRule(rule)) {
    throw new TypeError('Invalid rule');
  }
}
