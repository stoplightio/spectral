import { isAbsolute, resolve } from '@stoplight/path';
import { Optional } from '@stoplight/types';
import { IRulesetReadOptions, readRuleset } from '../../../../ruleset';
import { getDefaultRulesetFile } from '../../../../ruleset/utils';
import { IRuleset } from '../../../../types/ruleset';
import { KNOWN_RULESETS } from '../../../../formats';

async function loadRulesets(cwd: string, rulesetFiles: string[], opts: IRulesetReadOptions): Promise<IRuleset> {
  if (rulesetFiles.length === 0) {
    return {
      functions: {},
      rules: {},
      exceptions: {},
    };
  }

  return readRuleset(
    rulesetFiles.map(file => (isAbsolute(file) ? file : resolve(cwd, file))),
    opts,
  );
}

export async function getRuleset(rulesetFile: Optional<string[]>, opts: IRulesetReadOptions): Promise<IRuleset> {
  const rulesetFiles = rulesetFile ?? (await getDefaultRulesetFile(process.cwd()));

  return await (rulesetFiles !== null
    ? loadRulesets(process.cwd(), Array.isArray(rulesetFiles) ? rulesetFiles : [rulesetFiles], opts)
    : readRuleset(KNOWN_RULESETS, opts));
}
