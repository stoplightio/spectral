import { RulesetScopedAliasDefinition } from '../types';

export function isSimpleAliasDefinition(
  alias: string | string[] | RulesetScopedAliasDefinition,
): alias is string | string[] {
  return typeof alias === 'string' || Array.isArray(alias);
}
