import { parse } from '@stoplight/yaml';
import { readFile } from 'fs';
// @ts-ignore
import * as fetch from 'node-fetch';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

async function doRead(name: string, encoding: string) {
  if (/^https:\/\//.test(name)) {
    const result = await fetch(name);
    return parse(await result.text());
  } else {
    try {
      return parse(await readFileAsync(name, encoding));
    } catch (ex) {
      throw new Error(`Could not read ${name}: ${ex.message}`);
    }
  }
}

export async function readParsable(name: string, encoding: string): Promise<unknown> {
  try {
    return await doRead(name, encoding);
  } catch (ex) {
    throw new Error(`Could not parse ${name}: ${ex.message}`);
  }
}
