import { readParsable } from '../fs/reader';
import { RuleCollection } from '../types';

export async function readRuleset(file: string): Promise<RuleCollection> {
  const ruleset = await readParsable(file, 'utf8');
  return ruleset.data;
}
