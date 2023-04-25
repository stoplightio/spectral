import { isPlainObject } from '@stoplight/json';
import { createValidator } from './ajv';
import { convertAjvErrors, RulesetValidationError } from './errors';
import type { FileRuleDefinition, RuleDefinition, RulesetDefinition } from '../types';
import AggregateError from 'es-aggregate-error';

export function assertValidRuleset(
  ruleset: unknown,
  format: 'js' | 'json' = 'js',
): asserts ruleset is RulesetDefinition {
  if (!isPlainObject(ruleset)) {
    throw new RulesetValidationError('invalid-ruleset-definition', 'Provided ruleset is not an object', []);
  }

  if (!('rules' in ruleset) && !('extends' in ruleset) && !('overrides' in ruleset)) {
    throw new RulesetValidationError(
      'invalid-ruleset-definition',
      'Ruleset must have rules or extends or overrides defined',
      [],
    );
  }

  const validate = createValidator(format);

  if (!validate(ruleset)) {
    throw new AggregateError(convertAjvErrors(validate.errors ?? []));
  }
}

function isRuleDefinition(rule: FileRuleDefinition): rule is RuleDefinition {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}

export function assertValidRule(rule: FileRuleDefinition, name: string): asserts rule is RuleDefinition {
  if (!isRuleDefinition(rule)) {
    throw new RulesetValidationError('invalid-rule-definition', 'Rule definition expected', ['rules', name]);
  }
}
