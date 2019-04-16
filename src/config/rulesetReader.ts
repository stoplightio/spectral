import { getLocationForJsonPath } from '@stoplight/yaml';
import { resolve } from 'path';
import { Spectral } from '..';
import Lint from '../cli/commands/lint';
import { formatOutput, writeOutput } from '../cli/utils/output';
import { readParsable } from '../fs/reader';
import { spectralRules } from '../rulesets/spectral';
import { IParsedResult, IRuleResult, RuleCollection } from '../types';

export async function readRuleset(file: string, command: Lint): Promise<RuleCollection> {
  const parsed = await readParsable(file, 'utf8');
  const { data: ruleset } = parsed;
  const results = await lintRuleset(file, parsed);
  await conditionallyOutputLintingResults(results, command);
  return ruleset.rules;
}

async function lintRuleset(file: string, parsed: any) {
  const spectral = new Spectral();
  spectral.addRules(spectralRules());
  const parsedResult: IParsedResult = {
    source: resolve(process.cwd(), file),
    parsed,
    getLocationForJsonPath,
  };
  return spectral.run(parsedResult);
}

async function conditionallyOutputLintingResults(results: IRuleResult[], command: Lint) {
  if (results.length) {
    const output = await formatOutput(results, {
      format: 'stylish',
    });
    try {
      await writeOutput(output, {}, command);
      command.error('Provided ruleset is not valid', { exit: 1 });
    } catch (ex) {
      command.error(ex, { exit: 2 });
      throw new Error(ex);
    }
  }
}
