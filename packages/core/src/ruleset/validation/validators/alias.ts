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

export function validateAlias(
  ruleset: { aliases?: Record<string, unknown>; overrides?: Record<string, unknown> },
  alias: string,
  path: string,
): Error | void {
  const parsedPath = toParsedPath(path);

  try {
    const formats: unknown = get(ruleset, [...parsedPath.slice(0, parsedPath.indexOf('rules') + 2), 'formats']);

    const aliases =
      parsedPath[0] === 'overrides'
        ? {
            ...ruleset.aliases,
            ...getOverrides(ruleset.overrides, parsedPath[1]),
          }
        : ruleset.aliases;

    resolveAlias(aliases ?? null, alias, Array.isArray(formats) ? new Formats(formats) : null);
  } catch (ex) {
    if (ex instanceof ReferenceError) {
      return new RulesetValidationError('undefined-alias', ex.message, parsedPath);
    }

    return wrapError(ex, path);
  }
}
