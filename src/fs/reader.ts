import { readFile } from 'fs';
const fetch = require('node-fetch');
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

export const isURL = (uri: string) => /^https?:\/\//.test(uri);

async function doRead(name: string, encoding: string) {
  if (isURL(name)) {
    const result = await fetch(name);
    return await result.text();
  } else {
    try {
      return await readFileAsync(name, encoding);
    } catch (ex) {
      throw new Error(`Could not read ${name}: ${ex.message}`);
    }
  }
}

export async function readParsable(name: string, encoding: string): Promise<string> {
  try {
    return await doRead(name, encoding);
  } catch (ex) {
    throw new Error(`Could not parse ${name}: ${ex.message}`);
  }
}
