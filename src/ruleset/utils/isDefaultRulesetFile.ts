const DEFAULT_RULESET_FILE = /^\.?spectral\.(?:ya?ml|json)$/;

export const isDefaultRulesetFile = (uri: string): boolean => DEFAULT_RULESET_FILE.test(uri);
