function resolveSpectralRuleset(ruleset: string) {
  return `@stoplight/spectral/rulesets/${ruleset}/index.json`;
}
export const rulesetsMap = new Map<string, string>([
  ['spectral:oas', resolveSpectralRuleset('oas')],
  ['spectral:oas2', resolveSpectralRuleset('oas2')],
  ['spectral:oas3', resolveSpectralRuleset('oas3')],
]);
