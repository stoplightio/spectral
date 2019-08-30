import { isAbsolute, resolve } from '@stoplight/path';
import { IParserResult, Optional } from '@stoplight/types';
import { getLocationForJsonPath, parseWithPointers } from '@stoplight/yaml';

import { readParsable } from '../../fs/reader';
import { httpAndFileResolver } from '../../resolvers/http-and-file';
import { getDefaultRulesetFile } from '../../rulesets/loader';
import { isOpenApiv2, isOpenApiv3 } from '../../rulesets/lookups';
import { readRuleset } from '../../rulesets/reader';
import { Spectral } from '../../spectral';
import { IParsedResult, RuleCollection } from '../../types';
import { ILintConfig } from '../../types/config';
import { IRuleset } from '../../types/ruleset';

export async function loadRulesets(cwd: string, rulesetFiles: string | string[] | null): Promise<IRuleset> {
  if (rulesetFiles === null || rulesetFiles.length === 0) {
    return {
      functions: {},
      rules: {},
    };
  }

  return readRuleset(
    (Array.isArray(rulesetFiles) ? rulesetFiles : [rulesetFiles]).map(
      file => (isAbsolute(file) ? file : resolve(cwd, file)),
    ),
  );
}

export async function lint(name: string, flags: ILintConfig, rulesetFile: Optional<string | string[]>) {
  if (flags.verbose) {
    console.info(`Linting ${name}`);
  }

  const targetUri = !/^https?:\/\//.test(name) && !isAbsolute(name) ? resolve(process.cwd(), name) : name;

  const spec: IParserResult = parseWithPointers(await readParsable(targetUri, { encoding: flags.encoding }), {
    ignoreDuplicateKeys: false,
    mergeKeys: true,
  });

  const rulesetFiles = rulesetFile || (await getDefaultRulesetFile(process.cwd()));
  const ruleset = await (rulesetFiles ? loadRulesets(process.cwd(), rulesetFiles) : readRuleset('spectral:oas'));

  const spectral = new Spectral({ resolver: httpAndFileResolver });

  if (flags.verbose) {
    if (ruleset) {
      console.info(`Found ${Object.keys(ruleset.rules).length} rules`);
    } else {
      console.info('No rules loaded, attempting to detect document type');
    }
  }

  spectral.registerFormat('oas2', document => {
    if (isOpenApiv2(document)) {
      if (!flags.quiet) {
        console.log('OpenAPI 2.0 (Swagger) detected');
      }

      return true;
    }
    return false;
  });

  spectral.registerFormat('oas3', document => {
    if (isOpenApiv3(document)) {
      if (!flags.quiet) {
        console.log('OpenAPI 3.x detected');
      }

      return true;
    }
    return false;
  });

  spectral.setRuleset(ruleset);

  if (flags.skipRule) {
    spectral.setRules(skipRules(ruleset.rules, flags));
  }

  const parsedResult: IParsedResult = {
    source: targetUri,
    parsed: spec,
    getLocationForJsonPath,
  };

  return spectral.run(parsedResult, {
    resolve: {
      documentUri: targetUri,
    },
  });
}

const skipRules = (rules: RuleCollection, flags: ILintConfig): RuleCollection => {
  const skippedRules: string[] = [];
  const invalidRules: string[] = [];

  if (flags.skipRule !== undefined) {
    for (const rule of Array.isArray(flags.skipRule) ? flags.skipRule : [flags.skipRule]) {
      if (rule in rules) {
        delete rules[rule];
        skippedRules.push(rule);
      } else {
        invalidRules.push(rule);
      }
    }
  }

  if (invalidRules.length !== 0 && !flags.quiet) {
    console.warn(`ignoring invalid ${invalidRules.length > 1 ? 'rules' : 'rule'} "${invalidRules.join(', ')}"`);
  }

  if (skippedRules.length !== 0 && flags.verbose) {
    console.info(`skipping ${skippedRules.length > 1 ? 'rules' : 'rule'} "${skippedRules.join(', ')}"`);
  }

  return rules;
};
