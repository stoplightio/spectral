import { isAbsolute, resolve } from '@stoplight/path';
import { IParserResult, Optional } from '@stoplight/types';
import { getLocationForJsonPath, parseWithPointers } from '@stoplight/yaml';

import {
  isJSONSchema,
  isJSONSchemaDraft2019_09,
  isJSONSchemaDraft4,
  isJSONSchemaDraft6,
  isJSONSchemaDraft7,
  isJSONSchemaLoose,
  isOpenApiv2,
  isOpenApiv3,
} from '../../formats';
import { readParsable } from '../../fs/reader';
import { httpAndFileResolver } from '../../resolvers/http-and-file';
import { getDefaultRulesetFile } from '../../rulesets/loader';
import { readRuleset } from '../../rulesets/reader';
import { isRuleEnabled } from '../../runner';
import { Spectral } from '../../spectral';
import { FormatLookup, IParsedResult, RuleCollection } from '../../types';
import { ILintConfig } from '../../types/config';
import { IRuleset } from '../../types/ruleset';

export async function loadRulesets(cwd: string, rulesetFiles: string[]): Promise<IRuleset> {
  if (rulesetFiles.length === 0) {
    return {
      functions: {},
      rules: {},
    };
  }

  return readRuleset(rulesetFiles.map(file => (isAbsolute(file) ? file : resolve(cwd, file))));
}

const KNOWN_FORMATS: Array<[string, FormatLookup, string]> = [
  ['oas2', isOpenApiv2, 'OpenAPI 2.0 (Swagger) detected'],
  ['oas3', isOpenApiv3, 'OpenAPI 3.x detected'],
  ['json-schema', isJSONSchema, 'JSON Schema detected'],
  ['json-schema-loose', isJSONSchemaLoose, 'JSON Schema (loose) detected'],
  ['json-schema-draft4', isJSONSchemaDraft4, 'JSON Schema Draft 4 detected'],
  ['json-schema-draft6', isJSONSchemaDraft6, 'JSON Schema Draft 6 detected'],
  ['json-schema-draft7', isJSONSchemaDraft7, 'JSON Schema Draft 7 detected'],
  ['json-schema-2019-09', isJSONSchemaDraft2019_09, 'JSON Schema Draft 2019-09 detected'],
];

export async function lint(name: string, flags: ILintConfig, rulesetFile: Optional<string[]>) {
  if (flags.verbose) {
    console.info(`Linting ${name}`);
  }

  const targetUri = !/^https?:\/\//.test(name) && !isAbsolute(name) ? resolve(process.cwd(), name) : name;

  const spec: IParserResult = parseWithPointers(await readParsable(targetUri, { encoding: flags.encoding }), {
    ignoreDuplicateKeys: false,
    mergeKeys: true,
  });

  const rulesetFiles = rulesetFile || (await getDefaultRulesetFile(process.cwd()));
  const ruleset = await (rulesetFiles
    ? loadRulesets(process.cwd(), Array.isArray(rulesetFiles) ? rulesetFiles : [rulesetFiles])
    : readRuleset('spectral:oas'));

  const spectral = new Spectral({ resolver: httpAndFileResolver });

  for (const [format, lookup, message] of KNOWN_FORMATS) {
    spectral.registerFormat(format, document => {
      if (lookup(document)) {
        if (!flags.quiet) {
          console.log(message);
        }

        return true;
      }
      return false;
    });
  }

  spectral.setRuleset(ruleset);

  if (flags.verbose) {
    if (ruleset) {
      const rules = Object.values(spectral.rules);
      console.info(`Found ${rules.length} rules (${rules.filter(isRuleEnabled).length} enabled)`);
    } else {
      console.info('No rules loaded, attempting to detect document type');
    }
  }

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
