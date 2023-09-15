import * as process from 'process';
import { IRuleResult, Ruleset } from '@stoplight/spectral-core';
import { promises as fs } from 'fs';
import {
  html,
  json,
  junit,
  stylish,
  teamcity,
  text,
  pretty,
  githubActions,
  sarif,
} from '@stoplight/spectral-formatters';
import type { Formatter, FormatterOptions } from '@stoplight/spectral-formatters';
import type { OutputFormat } from './config';
import { VERSION } from '../version';

const formatters: Record<OutputFormat, Formatter> = {
  json,
  stylish,
  pretty,
  junit,
  html,
  text,
  teamcity,
  'github-actions': githubActions,
  sarif,
};

export function formatOutput(
  results: IRuleResult[],
  format: OutputFormat,
  formatOptions: FormatterOptions,
  ruleset: Ruleset,
): string {
  return formatters[format](results, formatOptions, {
    ruleset,
    spectralVersion: VERSION,
  });
}

export async function writeOutput(outputStr: string, outputFile: string): Promise<void> {
  if (outputFile !== '<stdout>') {
    await fs.writeFile(outputFile, outputStr);
  } else {
    process.stdout.write(outputStr);
  }
}
