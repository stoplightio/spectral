import { FormatterContext } from '../types';

/// Returns the documentation URL, either directly from the rule or by combining the ruleset documentation URL with the rule code.
export function getRuleDocumentationUrl(ruleCode: string | number, ctx?: FormatterContext): string | undefined {
  if (!ctx?.ruleset) {
    return undefined;
  }

  const rule = ctx.ruleset.rules[ruleCode.toString()];
  //if rule.documentationUrl is not null and not empty and not undefined, return it
  if (rule.documentationUrl != null && rule.documentationUrl) {
    return rule.documentationUrl;
  }

  //otherwise use the ruleset documentationUrl and append the rulecode as an anchor
  const rulesetDocumentationUrl = rule.owner?.definition.documentationUrl;
  if (rulesetDocumentationUrl != null && rulesetDocumentationUrl) {
    return `${rulesetDocumentationUrl}#${ruleCode}`;
  }

  return undefined;
}
