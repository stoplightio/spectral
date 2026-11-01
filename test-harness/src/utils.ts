const BRACES = /{([^}]+)}/g;

export const applyReplacements = (str: string, values: Record<string, string>): string => {
  const replacer = (match: string, identifier: string): string => {
    if (!(identifier in values)) {
      return match;
    }

    return values[identifier];
  };

  return str.replace(BRACES, replacer);
};

export const normalizeLineEndings = (str: string): string => str.replace(/\r?\n+/g, '');

// The packaged binary emits Node deprecation warnings (e.g. DEP0040 for `punycode`) on stderr.
// They come from dependencies we do not control, so drop them before any stderr assertion.
// Must run before normalizeLineEndings, which collapses the warning onto the same line as real output.
const DEPRECATION_WARNING = /^\(node:\d+\) \[DEP\d+\] DeprecationWarning:/;
const DEPRECATION_HINT = /^\(Use `.*--trace-deprecation.*`/;

export const stripDeprecationWarnings = (str: string): string =>
  str
    .split(/\r?\n/)
    .filter(line => !DEPRECATION_WARNING.test(line) && !DEPRECATION_HINT.test(line))
    .join('\n')
    .trim();
