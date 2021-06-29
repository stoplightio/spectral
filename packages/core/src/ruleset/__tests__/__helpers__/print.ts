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

function formatRules(
  ruleset: Ruleset,
): Record<string, Partial<Record<keyof Rule | 'inherited', string | Record<string, string>>>> {
  const { rules } = ruleset;
  const formattedRules: Record<string, Partial<Record<keyof Rule | 'inherited', string | Record<string, string>>>> = {};
  for (const rule of Object.values(rules)) {
    formattedRules[rule.name] = {
      name: rule.name,
      enabled: String(rule.enabled),
      inherited: String(rule.owner !== ruleset && (ruleset.source === null || rule.owner.source !== ruleset.source)),
      ...(rule.formats && rule.formats.size > 0 ? { formats: printFormats([...rule.formats]) } : null),
      given: printArray(rule.given),
      severity: String(rule.severity),
      ...(rule.documentationUrl !== null ? { documentationUrl: rule.documentationUrl } : null),
    };
  }

  return formattedRules;
}

function printFormats(formats: Format[]): Record<string, string> {
  return printArray(Array.from(formats).map(fn => fn.displayName ?? fn.name));
}

function printArray(array: string[]): Record<string, string> {
  return Object.fromEntries(Object.entries(array));
}
