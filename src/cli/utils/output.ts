import { writeFile } from 'fs';
import { promisify } from 'util';
import { IRuleResult } from '../..';
import { json, stylish } from '../../formatters';
import Lint from '../commands/lint';

const writeFileAsync = promisify(writeFile);

export async function formatOutput(results: IRuleResult[], flags: any): Promise<string> {
  if (flags.maxResults) {
    results = results.slice(0, flags.maxResults);
  }
  return {
    json: () => json(results),
    stylish: () => stylish(results),
  }[flags.format]();
}

export async function writeOutput(outputStr: string, flags: any, command: Lint) {
  if (flags.output) {
    return writeFileAsync(flags.output, outputStr);
  }

  command.log(outputStr);
}
