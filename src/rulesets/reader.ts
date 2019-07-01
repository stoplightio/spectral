import { readFile } from 'fs';
import { merge } from 'lodash';
import { promisify } from 'util';
import { PROJECT_ROOT } from '../consts';
import { RuleCollection } from '../types';
import { IRulesetFile } from '../types/ruleset';
import { formatAjv } from './ajv';
import { validateRuleset } from './validation';

const readFileAsync = promisify(readFile);

export async function readRulesFromRulesets(...rulesets: object[]): Promise<RuleCollection> {
  const rules = {};
  for (const ruleset of rulesets) {
    merge(rules, await readRulesFromRuleset(ruleset));
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

export async function readRulesFromRuleset(ruleset: object): Promise<RuleCollection> {
  if (!('rules' in ruleset)) {
    throw new Error('Provided ruleset is not valid');
  }

  const errors = validateRuleset(ruleset as IRulesetFile);

  if (errors.length) {
    throw new Error(`${formatAjv(errors)} Provided ruleset is not valid`);
  }

  const extendz = (ruleset as IRulesetFile).extends;
  const extendedRules = {};
  if (extendz && extendz.length) {
    for (const base of extendz) {
      merge(extendedRules, JSON.parse(await readFileAsync(resolveRuleset(base), 'utf-8')).rules);
    }
  }

  return merge(extendedRules, (ruleset as IRulesetFile).rules);
}

function resolveRuleset(uri: string) {
  if (uri.startsWith('@stoplight/spectral/')) {
    try {
      return uri.replace('@stoplight/spectral/', require.resolve('@stoplight/spectral'));
    } catch {
      return uri.replace('@stoplight/spectral/', `${PROJECT_ROOT}/`);
    }
  }

  return uri;
}
