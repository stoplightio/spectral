/* eslint-disable no-console */
import { Document, IRuleResult, Spectral } from '@stoplight/spectral-core';
import { readParsable, IFileReadOptions } from '@stoplight/spectral-runtime';
import * as Parsers from '@stoplight/spectral-parsers';
import { getRuleset, listFiles, segregateEntriesPerKind, readFileDescriptor } from './utils';
import { getResolver } from './utils/getResolver';
import { ILintConfig } from '../config';

export async function lint(documents: Array<number | string>, flags: ILintConfig): Promise<IRuleResult[]> {
  const spectral = new Spectral({
    resolver: getResolver(flags.resolver, process.env.PROXY),
  });

  const ruleset = await getRuleset(flags.ruleset);

  spectral.setRuleset(ruleset);
  if (flags.verbose === true) {
    const rules = Object.values(ruleset.rules);
    console.info(`Found ${rules.length} rules (${rules.filter(rule => rule.enabled).length} enabled)`);
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
      })),
    );
  }

  return results;
}

const createDocument = async (
  identifier: string | number,
  opts: IFileReadOptions,
): Promise<Document<unknown, Parsers.YamlParserResult<unknown>>> => {
  if (typeof identifier === 'string') {
    return new Document(await readParsable(identifier, opts), Parsers.Yaml, identifier);
  }

  return new Document(await readFileDescriptor(identifier, opts), Parsers.Yaml, '<STDIN>');
};
