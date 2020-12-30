import { extractPointerFromRef, extractSourceFromRef, pointerToPath } from '@stoplight/json';
import { isAbsolute, join, normalize as pathNormalize } from '@stoplight/path';
import { RulesetExceptionCollection } from '../../types/ruleset';

export class InvalidUriError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const normalize = ($ref: string, rulesetUri?: string): string => {
  const source = extractSourceFromRef($ref);

  if (rulesetUri === void 0 && source !== null && !isAbsolute(source)) {
    throw new InvalidUriError(
      buildInvalidUriErrorMessage(
        $ref,
        rulesetUri,
        'Only absolute Uris are allowed when no base ruleset uri has been provided',
      ),
    );
  }

  const pointer = extractPointerFromRef($ref);

  if (source === null && pointer === null) {
    throw new InvalidUriError(
      `Malformed exception key (${location}). You must provide either a valid pointer or a valid source, or a source with a pointer.`,
    );
  }

  if (pointer !== null) {
    try {
      pointerToPath(pointer);
    } catch {
      throw new InvalidUriError(buildInvalidUriErrorMessage($ref, rulesetUri));
    }
  }

  if (source === null) {
    return pointer as string;
  }

  const path = rulesetUri === undefined || isAbsolute(source) ? source : join(rulesetUri, '..', source);

  return pathNormalize(path) + (pointer ?? '');
};

const buildErrorMessagePrefix = ($ref: string, rulesetUri?: string): string => {
  let prefix = '';

  if (rulesetUri !== void 0) {
    prefix += `in ruleset \`${rulesetUri}\`, `;
  }

  return prefix + `\`except\` entry (key \`${$ref}\`) is malformed. `;
};

const buildInvalidUriErrorMessage = ($ref: string, rulesetUri?: string, precision?: string): string => {
  return (
    buildErrorMessagePrefix($ref, rulesetUri) +
    `Key \`${$ref}\` is not a valid uri${precision !== void 0 ? ` (${precision})` : ''}.`
  );
};

export function mergeExceptions(
  target: RulesetExceptionCollection,
  source: RulesetExceptionCollection,
  baseUri?: string,
): void {
  for (const [location, sourceRules] of Object.entries(source)) {
    const normalizedLocation = normalize(location, baseUri);
    const targetRules = normalizedLocation in target ? target[normalizedLocation] : [];

    const set = new Set(targetRules);

    if (sourceRules.length === 0) {
      throw new Error(buildErrorMessagePrefix(location, baseUri) + 'An empty array of rules has been provided.');
    }

    for (const rule of sourceRules) {
      if (rule.length === 0) {
        throw new Error(buildErrorMessagePrefix(location, baseUri) + 'A rule with an empty name has been provided.');
      }

      set.add(rule);
    }

    target[normalizedLocation] = [...set].sort((a, b) => a.localeCompare(b));
  }
}
