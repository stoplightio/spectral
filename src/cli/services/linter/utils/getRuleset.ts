import { isAbsolute, resolve } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import { readRuleset } from '../../../../rulesets';
import { getDefaultRulesetFile } from '../../../../rulesets/loader';
import { IRuleset } from '../../../../types/ruleset';

async function loadRulesets(cwd: string, rulesetFiles: string[]): Promise<IRuleset> {
  if (rulesetFiles.length === 0) {
    return {
      functions: {},
      rules: {},
    };
  }

  return readRuleset(rulesetFiles.map(file => (isAbsolute(file) ? file : resolve(cwd, file))));
}

export async function getRuleset(rulesetFile: Optional<string[]>) {
  const rulesetFiles = rulesetFile || (await getDefaultRulesetFile(process.cwd()));

  return await (rulesetFiles
    ? loadRulesets(process.cwd(), Array.isArray(rulesetFiles) ? rulesetFiles : [rulesetFiles])
    : readRuleset('spectral:oas'));
}
