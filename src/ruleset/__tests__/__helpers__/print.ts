import { asTree } from 'treeify';
import { Rule } from '../../rule/rule';
import { Ruleset } from '../../ruleset';
import { RulesetDefinition } from '../../types';
import { Format } from '../../format';

// type Filter = 'enabled-only' | 'disabled-only' | 'recommended-only';

export function print(ruleset: Ruleset | RulesetDefinition): string {
  if (!(ruleset instanceof Ruleset)) {
    ruleset = new Ruleset(ruleset, { severity: 'recommended' });
  }

  return asTree(
    {
      ...(ruleset.formats.size > 0 ? { formats: printFormats([...ruleset.formats]) } : null),
      rules: formatRules(ruleset),
    },
    true,
    true,
  );
}

function formatRules(ruleset: Ruleset): Record<string, Partial<Record<keyof Rule | 'inherited', string>>> {
  const { rules } = ruleset;
  const formattedRules: Record<string, Partial<Record<keyof Rule | 'inherited', string>>> = {};
  for (const rule of Object.values(rules)) {
    formattedRules[rule.name] = {
      name: rule.name,
      enabled: String(rule.enabled),
      inherited: String(rule.owner !== ruleset),
      ...(rule.formats ? { formats: printFormats([...rule.formats]) } : null),
      severity: String(rule.severity),
      ...(rule.documentationUrl !== null ? { documentationUrl: rule.documentationUrl } : null),
    };
  }

  return formattedRules;
}

function printFormats(formats: Format[]): string {
  return Array.from(formats)
    .map(fn => fn.displayName ?? fn.name)
    .join(', ');
}
