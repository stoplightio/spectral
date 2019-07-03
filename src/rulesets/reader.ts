import { parse } from '@stoplight/yaml';
import { readParsable } from '../fs/reader';
import { RuleCollection } from '../types';
import { IRuleset, IRulesetFile } from '../types/ruleset';
import { mergeConfigs } from './merger';
import { resolvePath } from './resolver';
import { assertValidRuleset } from './validation';

export async function readRulesFromRulesets(...uris: string[]): Promise<RuleCollection> {
  const base: IRuleset = {
    rules: {},
  };

  for (const uri of uris) {
    mergeConfigs(base, await readRulesFromRuleset('', uri));
  }

  for (const [name, rule] of Object.entries(base.rules)) {
    if (rule.severity === 'off') {
      delete base.rules[name];
    }
  }

  return base.rules; // todo: return the entire config
}

async function readRulesFromRuleset(baseUri: string, uri: string): Promise<IRulesetFile> {
  const ruleset = assertValidRuleset(parse(await readParsable(await resolvePath(baseUri, uri), 'utf-8')));

  const extendz = ruleset.extends;

  if (extendz && extendz.length) {
    for (const extended of extendz) {
      mergeConfigs(ruleset, await readRulesFromRuleset(uri, extended));
    }
  }

  return ruleset;
}
