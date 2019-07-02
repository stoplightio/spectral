import { isURL } from '@stoplight/path';
import { readFile } from 'fs';
const fetch = require('node-fetch');

async function doRead(name: string, encoding: string) {
  if (isURL(name)) {
    const result = await fetch(name);
    return await result.text();
  } else {
    try {
      return await new Promise((resolve, reject) => {
        readFile(name, encoding, (err, data) => {
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
    return await doRead(name, encoding);
  } catch (ex) {
    throw new Error(`Could not parse ${name}: ${ex.message}`);
  }
}
