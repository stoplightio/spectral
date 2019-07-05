import { parse } from '@stoplight/yaml';
import { readParsable } from '../fs/reader';
import { RuleCollection } from '../types';
import { IRuleset, IRulesetFile } from '../types/ruleset';
import { findRuleset } from './finder';
import { mergeRulesets } from './merger';
import { assertValidRuleset } from './validation';

export async function readRulesFromRulesets(...uris: string[]): Promise<RuleCollection> {
  const base: IRuleset = {
    rules: {},
  };

  for (const uri of uris) {
    mergeRulesets(base, await readRulesFromRuleset('', uri));
  }

  return base.rules;
}

async function readRulesFromRuleset(baseUri: string, uri: string): Promise<IRulesetFile> {
  const ruleset = assertValidRuleset(parse(await readParsable(await findRuleset(baseUri, uri), 'utf8')));

  const newRuleset: IRulesetFile = {
    rules: {},
  };

  const extendz = ruleset.extends;

  if (extendz && extendz.length) {
    for (const extended of extendz) {
      if (Array.isArray(extended)) {
        mergeRulesets(newRuleset, await readRulesFromRuleset(uri, extended[0]), extended[1]);
      } else {
        mergeRulesets(newRuleset, await readRulesFromRuleset(uri, extended));
      }
    }
  }

  return mergeRulesets(newRuleset, ruleset);
}
