import { Dictionary } from '@stoplight/types';
import { writeFile } from 'fs';
import { promisify } from 'util';
import { html, json, junit, stylish, teamcity, text } from '../../formatters';
import { Formatter } from '../../formatters/types';
import { IRuleResult } from '../../types';
import { OutputFormat } from '../../types/config';

const writeFileAsync = promisify(writeFile);

const formatters: Dictionary<Formatter, OutputFormat> = {
  json,
  stylish,
  junit,
  html,
  text,
  teamcity,
};

export function formatOutput(results: IRuleResult[], format: OutputFormat): string {
  return formatters[format](results);
}

export async function writeOutput(outputStr: string, outputFile?: string) {
  if (outputFile) {
    return writeFileAsync(outputFile, outputStr);
  }
  console.log(outputStr);
}
