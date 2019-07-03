import * as path from '@stoplight/path';
import { parse } from '@stoplight/yaml';
import { merge } from 'lodash';
import { readParsable } from '../fs/reader';
import { RuleCollection } from '../types';
import { IRulesetFile } from '../types/ruleset';
import { resolvePath } from './resolver';
import { assertValidRuleset } from './validation';

export async function readRulesFromRulesets(...uris: string[]): Promise<RuleCollection> {
  const rules = {};
  for (const uri of uris) {
    merge(rules, await readRulesFromRuleset(uri));
  }

  return rules;
}

export type Logger = {
  log: (message?: string | undefined, ...args: any[]) => void;
  error: (
    input: string | Error,
    options?:
      | {
          code?: string | undefined;
          exit?: number | undefined;
        }
      | undefined,
  ) => never;
};

async function readRulesFromRuleset(uri: string): Promise<RuleCollection> {
  const base = path.dirname(uri);
  const ruleset = assertValidRuleset(parse(await readParsable(uri, 'utf-8')));

  const extendz = ruleset.extends;
  const extendedRules = {};
  if (extendz && extendz.length) {
    for (const extended of extendz) {
      const extendedRuleset = assertValidRuleset(parse(await readParsable(await resolvePath(base, extended), 'utf-8')));
      merge(extendedRules, (extendedRuleset as IRulesetFile).rules);
    }
  }

  return merge(extendedRules, (ruleset as IRulesetFile).rules);
}
