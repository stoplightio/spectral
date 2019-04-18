import Lint from '../cli/commands/lint';
import { formatAjv } from '../formatters/ajv';
import { readParsable } from '../fs/reader';
import { RuleCollection } from '../types';
import { validateRuleset } from './validation';

export async function readRuleset(file: string, command: Lint): Promise<RuleCollection> {
  const parsed = await readParsable(file, 'utf8');
  const { data: ruleset } = parsed;
  const errors = validateRuleset(ruleset);

  if (errors.length) {
    command.log(formatAjv(errors));
    command.error('Provided ruleset is not valid', { exit: 1 });
  }

  return ruleset.rules;
}
