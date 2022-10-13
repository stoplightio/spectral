import { isScopedAliasDefinition, isSimpleAliasDefinition } from './utils/guards';
import type { RulesetScopedAliasDefinition } from './types';

const ALIAS = /^#([A-Za-z0-9_-]+)/;

export function resolveAliasForFormats(
  { targets }: RulesetScopedAliasDefinition,
  formats: Set<unknown> | null,
): string[] | null {
  if (formats === null || formats.size === 0) {
    return null;
  }

  // we start from the end to be consistent with overrides etc. - we generally tend to pick the "last" value.
  for (let i = targets.length - 1; i >= 0; i--) {
    const target = targets[i];
    for (const format of target.formats) {
      if (formats.has(format)) {
        return target.given;
      }
    }
  }

  return null;
}

export function resolveAlias(
  aliases: Record<string, unknown> | null,
  expression: string,
  formats: Set<unknown> | null,
): string[] {
  return _resolveAlias(aliases, expression, formats, new Set());
}

function _resolveAlias(
  aliases: Record<string, unknown> | null,
  expression: string,
  formats: Set<unknown> | null,
  stack: Set<string>,
): string[] {
  const resolvedExpressions: string[] = [];

  if (expression.startsWith('#')) {
    const alias = ALIAS.exec(expression)?.[1];

    if (alias === void 0 || alias === null) {
      throw new TypeError(`Alias must match /^#([A-Za-z0-9_-]+)/`);
    }

    if (stack.has(alias)) {
      const _stack = [...stack, alias];
      throw new Error(`Alias "${_stack[0]}" is circular. Resolution stack: ${_stack.join(' -> ')}`);
    }

    stack.add(alias);

    if (aliases === null || !(alias in aliases)) {
      throw new ReferenceError(`Alias "${alias}" does not exist`);
    }

    const aliasValue = aliases[alias];
    let actualAliasValue: string[] | null;
    if (isSimpleAliasDefinition(aliasValue)) {
      actualAliasValue = aliasValue;
    } else if (isScopedAliasDefinition(aliasValue)) {
      actualAliasValue = resolveAliasForFormats(aliasValue, formats);
    } else {
      actualAliasValue = null;
    }

    if (actualAliasValue !== null) {
      resolvedExpressions.push(
        ...actualAliasValue.flatMap(item =>
          _resolveAlias(aliases, item + expression.slice(alias.length + 1), formats, new Set([...stack])),
        ),
      );
    }
  } else {
    resolvedExpressions.push(expression);
  }

  return resolvedExpressions;
}
