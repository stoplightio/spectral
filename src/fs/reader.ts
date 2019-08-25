import { isURL } from '@stoplight/path';
import * as fs from 'fs';
const fetch = require('node-fetch');

export async function readFile(name: string, encoding: string) {
  if (isURL(name)) {
    const response = await fetch(name);
    if (!response.ok) throw new Error(response.statusText);
    return await response.text();
  } else {
    try {
      return await new Promise((resolve, reject) => {
        fs.readFile(name, encoding, (err, data) => {
          if (err !== null) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    } catch (ex) {
      throw new Error(`Could not read ${name}: ${ex.message}`);
    }
  }
}

export async function readParsable(name: string, encoding: string): Promise<string> {
  try {
    return await readFile(name, encoding);
  } catch (ex) {
    throw new Error(`Could not parse ${name}: ${ex.message}`);
  }
}
