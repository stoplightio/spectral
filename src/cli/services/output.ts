import { writeFile } from 'fs';
import { promisify } from 'util';
import { json, stylish } from '../../formatters';
import { IRuleResult } from '../../types';
import { OutputFormat } from '../../types/config';

const writeFileAsync = promisify(writeFile);

export async function formatOutput(results: IRuleResult[], format: OutputFormat): Promise<string> {
  return {
    json: () => json(results),
    stylish: () => stylish(results),
  }[format]();
}

export async function writeOutput(outputStr: string, outputFile?: string) {
  if (outputFile) {
    return writeFileAsync(outputFile, outputStr);
  }
  console.log(outputStr);
}
