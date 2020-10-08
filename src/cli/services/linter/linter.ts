import { Document, STDIN } from '../../../document';
import { KNOWN_FORMATS } from '../../../formats';
import { readParsable } from '../../../fs/reader';
import * as Parsers from '../../../parsers';
import { IRuleResult, Spectral } from '../../../spectral';
import { ILintConfig } from '../../../types/config';
import { getRuleset, listFiles, skipRules } from './utils';
import { getResolver } from './utils/getResolver';

export async function lint(documents: Array<number | string>, flags: ILintConfig): Promise<IRuleResult[]> {
  const spectral = new Spectral({
    resolver: getResolver(flags.resolver),
  });

  const ruleset = await getRuleset(flags.ruleset);
  spectral.setRuleset(ruleset);

  for (const [format, lookup, prettyName] of KNOWN_FORMATS) {
    spectral.registerFormat(format, document => {
      if (lookup(document)) {
        if (!flags.quiet) {
          console.log(`${prettyName} detected`);
        }

        return true;
      }

      return false;
    });
  }

  if (flags.verbose) {
    if (ruleset) {
      const rules = Object.values(spectral.rules);
      console.info(`Found ${rules.length} rules (${rules.filter(rule => rule.enabled).length} enabled)`);
    } else {
      console.info('No rules loaded, attempting to detect document type');
    }
  }

  if (flags.skipRule) {
    spectral.setRules(skipRules(ruleset.rules, flags));
  }

  const [targetUris, unmatchedPatterns] = await listFiles(
    documents,
    !(flags.showUnmatchedGlobs || flags.failOnUnmatchedGlobs),
  );
  const results: IRuleResult[] = [];

  if (unmatchedPatterns.length > 0) {
    if (flags.failOnUnmatchedGlobs) {
      throw new Error(`Unmatched glob patterns: \`${unmatchedPatterns.join(',')}\``);
    }

    for (const unmatchedPattern of unmatchedPatterns) {
      console.log(`Glob pattern \`${unmatchedPattern}\` did not match any files`);
    }
  }

  for (const targetUri of targetUris) {
    if (flags.verbose) {
      console.info(`Linting ${targetUri}`);
    }

    const document = new Document(
      await readParsable(targetUri, { encoding: flags.encoding }),
      Parsers.Yaml,
      typeof targetUri === 'number' ? STDIN : targetUri,
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
