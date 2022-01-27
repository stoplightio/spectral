import * as process from 'process';
import { IRuleResult } from '@stoplight/spectral-core';
import { promises as fs } from 'fs';
import { html, json, junit, stylish, teamcity, text, pretty } from '../formatters';
import { Formatter, FormatterOptions } from '../formatters/types';
import type { OutputFormat } from './config';

const formatters: Record<OutputFormat, Formatter> = {
  json,
  stylish,
  pretty,
  junit,
  html,
  text,
  teamcity,
};

export function formatOutput(results: IRuleResult[], format: OutputFormat, formatOptions: FormatterOptions): string {
  return formatters[format](results, formatOptions);
}

export async function writeOutput(outputStr: string, outputFile: string): Promise<void> {
  if (outputFile !== '<stdout>') {
    await fs.writeFile(outputFile, outputStr);
  } else {
    process.stdout.write(outputStr);
  }
}
