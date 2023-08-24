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
