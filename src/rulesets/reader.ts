import merge = require('lodash/merge');
import Lint from '../cli/commands/lint';
import { readParsable } from '../fs/reader';
import { RuleCollection } from '../types';
import { IRulesetFile } from '../types/ruleset';
import { formatAjv } from './ajv';
import { resolvePath } from './path';
import { validateRuleset } from './validation';

export async function readRulesets(command: Lint, ...files: string[]): Promise<RuleCollection> {
  const rulesets = await Promise.all(files.map(file => readRuleset(command, file)));
  return merge({}, ...rulesets);
}

async function readRuleset(command: Lint, file: string): Promise<RuleCollection> {
  command.log(`Reading ruleset ${file}`);
  const parsed = await readParsable(file, 'utf8');
  const { data: ruleset } = parsed;
  const errors = validateRuleset(ruleset);

  if (errors.length) {
    command.log(formatAjv(errors));
    command.error(`Provided ruleset '${file}' is not valid`, { exit: 1 });
  }

  const extendz = (ruleset as IRulesetFile).extends;
  let extendedRules = {};
  if (extendz && extendz.length) {
    extendedRules = await blendRuleCollections(
      extendz.map(extend => {
        return readRuleset(command, resolvePath(file, extend));
      }),
    );
  }

  return merge(extendedRules, ruleset.rules);
}

export async function blendRuleCollections(futureCollections: Array<Promise<RuleCollection>>) {
  return Promise.all(futureCollections).then(collections => merge({}, ...collections));
}
