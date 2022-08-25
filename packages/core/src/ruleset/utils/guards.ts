import { isPlainObject } from '@stoplight/json';
import { isString } from 'lodash';
import type { RulesetScopedAliasDefinition } from '../types';

export function isSimpleAliasDefinition(alias: unknown): alias is string[] {
  return Array.isArray(alias);
}

export function isValidAliasTarget(
  target: Record<string, unknown>,
): target is RulesetScopedAliasDefinition['targets'][number] {
  const formats = target.formats;
  if (!Array.isArray(formats) && !(formats instanceof Set)) {
    return false;
  }

  return Array.isArray(target.given) && target.given.every(isString);
}

export function isScopedAliasDefinition(alias: unknown): alias is RulesetScopedAliasDefinition {
  return isPlainObject(alias) && Array.isArray(alias.targets) && alias.targets.every(isValidAliasTarget);
}
