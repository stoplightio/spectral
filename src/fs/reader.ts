import { IParserResult } from '@stoplight/types';
import { parseWithPointers } from '@stoplight/yaml';
import { existsSync, readFileSync } from 'fs';
// @ts-ignore
import * as fetch from 'node-fetch';

async function doRead(name: string, encoding: string) {
  if (name.startsWith('http')) {
    const result = await fetch(name);
    const parsed = parseWithPointers(await result.text());
    console.error(parsed);
    return parsed;
  } else if (existsSync(name)) {
    try {
      const parsed = parseWithPointers(readFileSync(name, encoding));
      console.error(parsed);
      return parsed;
    } catch (ex) {
      throw new Error(`Could not read ${name}: ${ex.message}`);
    }
  }
  throw new Error(`${name} does not exist`);
}

export async function readParsable(name: string, encoding: string): Promise<IParserResult> {
  try {
    return doRead(name, encoding);
  } catch (ex) {
    throw new Error(`Could not parse ${name}: ${ex.message}`);
  }
}
