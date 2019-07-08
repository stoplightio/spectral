import { parse } from '@stoplight/yaml';
import { readParsable } from '../fs/reader';
import { RuleCollection } from '../types';
import { FileRulesetSeverity, IRuleset, IRulesetFile } from '../types/ruleset';
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

async function readRulesFromRuleset(
  baseUri: string,
  uri: string,
  severity?: FileRulesetSeverity,
): Promise<IRulesetFile> {
  const ruleset = assertValidRuleset(parse(await readParsable(await findRuleset(baseUri, uri), 'utf8')));

  const newRuleset: IRulesetFile = {
    rules: {},
  };

  const extendz = ruleset.extends;

  if (extendz && extendz.length) {
    for (const extended of extendz) {
      if (Array.isArray(extended)) {
        const parentSeverity = severity === undefined ? extended[1] : severity;
        mergeRulesets(newRuleset, await readRulesFromRuleset(uri, extended[0], parentSeverity), parentSeverity);
      } else {
        const parentSeverity = severity === undefined ? 'recommended' : severity;
        mergeRulesets(newRuleset, await readRulesFromRuleset(uri, extended, parentSeverity), parentSeverity);
      }
    }
  }

  return mergeRulesets(newRuleset, ruleset);
}
