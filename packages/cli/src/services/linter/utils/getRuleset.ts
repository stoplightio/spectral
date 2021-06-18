import { Optional } from '@stoplight/types';
import { Ruleset } from '../../../../ruleset/ruleset';
import * as fs from 'fs';
import * as path from '@stoplight/path';
import { isDefaultRulesetFile } from '../../../../ruleset/utils';
import { isAbsolute } from '@stoplight/path';
import * as process from 'process';
import { RulesetDefinition } from '@stoplight/spectral-core';

async function getDefaultRulesetFile(): Promise<Optional<string>> {
  const cwd = process.cwd();
  for (const filename of await fs.promises.readdir(cwd)) {
    if (isDefaultRulesetFile(filename)) {
      return path.join(cwd, filename);
    }
  }

  return;
}

export async function getRuleset(rulesetFile: Optional<string>): Promise<Ruleset> {
  if (rulesetFile === void 0) {
    rulesetFile = await getDefaultRulesetFile();
  } else if (!isAbsolute(rulesetFile)) {
    rulesetFile = path.join(process.cwd(), rulesetFile);
  }

  if (rulesetFile === void 0) {
    return new Ruleset({ rules: {} });
  }

  const ruleset = (await import(rulesetFile)) as { default: RulesetDefinition } | RulesetDefinition;

  return new Ruleset('default' in ruleset ? ruleset.default : ruleset, { severity: 'recommended' });
}
