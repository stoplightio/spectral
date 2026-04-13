import { isPlainObject } from '@stoplight/json';
import { get } from 'lodash';
import { resolveAlias } from '../../alias';
import { Formats } from '../../formats';
import { toParsedPath, wrapError } from './common/error';
import { RulesetValidationError } from '../errors';

function getOverrides(overrides: unknown, key: string): Record<string, unknown> | null {
  if (!Array.isArray(overrides)) return null;

  const index = Number(key);
  if (Number.isNaN(index)) return null;
  if (index < 0 && index >= overrides.length) return null;

  const actualOverrides: unknown = overrides[index];
  return isPlainObject(actualOverrides) && isPlainObject(actualOverrides.aliases) ? actualOverrides.aliases : null;
}

function getExtended(extended: Record<string, unknown>, parsedPath: string[]): Record<string, unknown> | null {
  if (!Array.isArray(extended)) return null;

  const key = parsedPath[1];
  const index = Number(key);
  if (Number.isNaN(index)) return null;
  if (index < 0 && index >= extended.length) return null;

  const item: Record<string, unknown> = extended[index] as Record<string, unknown>;
  const isTuple = Array.isArray(item);
  const actualExtended: {
    aliases?: Record<string, unknown>;
    overrides?: Record<string, unknown>;
    extends?: Record<string, unknown>;
  } = (isTuple ? item[0] : item) as Record<string, unknown>;
  const aliases =
    isPlainObject(actualExtended) && isPlainObject(actualExtended.aliases) ? actualExtended.aliases : null;

  const overridesPathIndex = isTuple ? 3 : 2;
  if (parsedPath.length >= overridesPathIndex + 2 && parsedPath[overridesPathIndex] === 'overrides') {
    return {
      ...aliases,
      ...getOverrides(actualExtended.overrides, parsedPath[overridesPathIndex + 1]),
    };
  }

  if (parsedPath.length >= overridesPathIndex + 2 && parsedPath[overridesPathIndex] === 'extends') {
    if (isPlainObject(actualExtended) && Array.isArray(actualExtended.extends)) {
      const nestedAliases = getExtended(
        actualExtended.extends as Record<string, unknown>,
        parsedPath.slice(overridesPathIndex),
      );
      return nestedAliases ?? aliases;
    }
  }

  return aliases;
}

function getResolvedAliases(
  parsedPath: string[],
  ruleset: {
    aliases?: Record<string, unknown>;
    overrides?: Record<string, unknown>;
    extends?: Record<string, unknown>;
  },
) {
  if (parsedPath[0] === 'extends') {
    return getExtended(ruleset.extends as Record<string, unknown>, parsedPath);
  } else if (parsedPath[0] === 'overrides') {
    return {
      ...ruleset.aliases,
      ...getOverrides(ruleset.overrides, parsedPath[1]),
    };
  } else {
    return ruleset.aliases;
  }
}

export function validateAlias(
  ruleset: {
    aliases?: Record<string, unknown>;
    overrides?: Record<string, unknown>;
    extends?: Record<string, unknown>;
  },
  alias: string,
  path: string,
): Error | void {
  const parsedPath = toParsedPath(path);

  try {
    const formats: unknown = get(ruleset, [...parsedPath.slice(0, parsedPath.indexOf('rules') + 2), 'formats']);

    const aliases = getResolvedAliases(parsedPath, ruleset);

    resolveAlias(aliases ?? null, alias, Array.isArray(formats) ? new Formats(formats) : null);
  } catch (ex) {
    if (ex instanceof ReferenceError) {
      return new RulesetValidationError('undefined-alias', ex.message, parsedPath);
    }

    return wrapError(ex, path);
  }
}
