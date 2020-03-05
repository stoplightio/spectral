import { Document, StdIn } from '../../../document';
import {
  isJSONSchema,
  isJSONSchemaDraft2019_09,
  isJSONSchemaDraft4,
  isJSONSchemaDraft6,
  isJSONSchemaDraft7,
  isJSONSchemaLoose,
  isOpenApiv2,
  isOpenApiv3,
} from '../../../formats';
import { readParsable } from '../../../fs/reader';
import * as Parsers from '../../../parsers';
import { isRuleEnabled } from '../../../runner';
import { IRuleResult, Spectral } from '../../../spectral';
import { FormatLookup } from '../../../types';
import { ILintConfig } from '../../../types/config';
import { getRuleset, listFiles, skipRules } from './utils';
import { getResolver } from './utils/getResolver';

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

export async function lint(documents: Array<number | string>, flags: ILintConfig) {
  const spectral = new Spectral({
    resolver: getResolver(flags.resolver),
  });

  const ruleset = await getRuleset(flags.ruleset);
  spectral.setRuleset(ruleset);

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

  const targetUris = await listFiles(documents);
  const results: IRuleResult[] = [];

  for (const targetUri of targetUris) {
    if (flags.verbose) {
      console.info(`Linting ${targetUri}`);
    }

    const document = new Document(
      await readParsable(targetUri, { encoding: flags.encoding }),
      Parsers.Yaml,
      typeof targetUri === 'number' ? StdIn : targetUri,
    );

    results.push(
      ...(await spectral.run(document, {
        ignoreUnknownFormat: flags.ignoreUnknownFormat,
        resolve: {
          documentUri: typeof targetUri === 'number' ? void 0 : targetUri,
        },
      })),
    );
  }

  return results;
}
