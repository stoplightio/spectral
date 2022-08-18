import { isPlainObject } from '@stoplight/json';
import { get } from 'lodash';
import { resolveAlias } from '../../alias';
import { Formats } from '../../formats';
import { wrapError } from './common/error';

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
  try {
    const parsedPath = path.slice(1).split('/');
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
    return wrapError(ex, path);
  }
}
