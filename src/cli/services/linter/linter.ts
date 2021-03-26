import { Document, STDIN } from '../../../document';
import { KNOWN_FORMATS } from '../../../formats';
import { readParsable, IFileReadOptions } from '../../../fs/reader';
import * as Parsers from '../../../parsers';
import { IRuleResult, Spectral } from '../../../spectral';
import { ILintConfig } from '../../../types/config';
import { getRuleset, listFiles, segregateEntriesPerKind, readFileDescriptor } from './utils';
import { getResolver } from './utils/getResolver';
import { YamlParserResult } from '@stoplight/yaml';
import { DEFAULT_REQUEST_OPTIONS } from '../../../request';
import type { Agent } from 'https';

export async function lint(documents: Array<number | string>, flags: ILintConfig): Promise<IRuleResult[]> {
  const spectral = new Spectral({
    resolver: getResolver(flags.resolver),
    proxyUri: process.env.PROXY,
  });

  const ruleset = await getRuleset(flags.ruleset, {
    agent: DEFAULT_REQUEST_OPTIONS.agent as Agent,
  });

  spectral.setRuleset(ruleset);

  for (const [format, lookup, prettyName] of KNOWN_FORMATS) {
    spectral.registerFormat(format, document => {
      if (lookup(document)) {
        if (flags.quiet !== true) {
          console.log(`${prettyName} detected`);
        }

        return true;
      }

      return false;
    });
  }

  if (flags.verbose === true) {
    if (ruleset) {
      const rules = Object.values(spectral.rules);
      console.info(`Found ${rules.length} rules (${rules.filter(rule => rule.enabled).length} enabled)`);
    } else {
      console.info('No rules loaded, attempting to detect document type');
    }
  }

  const [globs, fileDescriptors] = segregateEntriesPerKind(documents);
  const [targetUris, unmatchedPatterns] = await listFiles(globs, !flags.failOnUnmatchedGlobs);
  const results: IRuleResult[] = [];

  if (unmatchedPatterns.length > 0) {
    if (flags.failOnUnmatchedGlobs) {
      throw new Error(`Unmatched glob patterns: \`${unmatchedPatterns.join(',')}\``);
    }

    for (const unmatchedPattern of unmatchedPatterns) {
      console.log(`Glob pattern \`${unmatchedPattern}\` did not match any files`);
    }
  }

  for (const targetUri of [...targetUris, ...fileDescriptors]) {
    if (flags.verbose === true) {
      console.info(`Linting ${targetUri}`);
    }

    const document = await createDocument(targetUri, { encoding: flags.encoding });

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

const createDocument = async (
  identifier: string | number,
  opts: IFileReadOptions,
): Promise<Document<unknown, YamlParserResult<unknown>>> => {
  if (typeof identifier === 'string') {
    return new Document(await readParsable(identifier, opts), Parsers.Yaml, identifier);
  }

  return new Document(await readFileDescriptor(identifier, opts), Parsers.Yaml, STDIN);
};
