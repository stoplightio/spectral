import { Dictionary } from '@stoplight/types';

function resolveSpectralRuleset(ruleset: string) {
  return `@stoplight/spectral/rulesets/${ruleset}/index.json`;
}

export const RESOLVE_ALIASES: Dictionary<string, string> = {
  'spectral:oas': resolveSpectralRuleset('oas'),
};

export const STATIC_ASSETS: Dictionary<string> = {};
