import merge = require('lodash/merge');
import { readParsable } from '../fs/reader';
import { RuleCollection } from '../types';
import { IRulesetFile } from '../types/ruleset';
import { formatAjv } from './ajv';
import { resolvePath } from './path';
import { validateRuleset } from './validation';

export async function readRulesFromRulesets(...files: string[]): Promise<RuleCollection> {
  const rulesets = await Promise.all(files.map(file => readRulesFromRuleset(file)));
  return merge({}, ...rulesets);
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

async function readRulesFromRuleset(file: string): Promise<RuleCollection> {
  const parsed = await readParsable(file, 'utf8');
  const { data: ruleset } = parsed;
  const errors = validateRuleset(ruleset);

  if (errors.length) {
    throw {
      messages: [formatAjv(errors), `Provided ruleset '${file}' is not valid`],
    };
  }

  const extendz = (ruleset as IRulesetFile).extends;
  let extendedRules = {};
  if (extendz && extendz.length) {
    extendedRules = await blendRuleCollections(
      extendz.map(extend => {
        return readRulesFromRuleset(resolvePath(file, extend));
      }),
    );
  }

  return merge(extendedRules, ruleset.rules);
}

export async function blendRuleCollections(futureCollections: Array<Promise<RuleCollection>>) {
  return Promise.all(futureCollections).then(collections => merge({}, ...collections));
}
