const DEFAULT_RULESET_FILE = /^\.?spectral\.m?(?:[jt])s$/;

export const isDefaultRulesetFile = (uri: string): boolean => DEFAULT_RULESET_FILE.test(uri);
