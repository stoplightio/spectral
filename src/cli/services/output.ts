import { Dictionary } from '@stoplight/types';
import { writeFile } from 'fs';
import { promisify } from 'util';
import { html, json, junit, stylish, teamcity, text, pretty } from '../formatters';
import { Formatter, FormatterOptions } from '../formatters/types';
import { IRuleResult } from '../../types';
import { OutputFormat } from '../../types/config';

const writeFileAsync = promisify(writeFile);

const formatters: Dictionary<Formatter, OutputFormat> = {
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

export async function writeOutput(outputStr: string, outputFile?: string) {
  if (outputFile) {
    return writeFileAsync(outputFile, outputStr);
  }
  console.log(outputStr);
}
