import { isURL } from '@stoplight/path';
import AbortController from 'abort-controller';
import * as fs from 'fs';
import request from '../request';

export interface IReadOptions {
  encoding: string;
  timeout?: number;
}

export async function readFile(name: string, opts: IReadOptions): Promise<string> {
  if (isURL(name)) {
    let response;
    let timeout: NodeJS.Timeout | number | null = null;
    try {
      if (opts.timeout) {
        const controller = new AbortController();
        timeout = setTimeout(() => {
          controller.abort();
        }, opts.timeout);
        response = await request(name, { signal: controller.signal });
      } else {
        response = await request(name);
      }

      if (!response.ok) throw new Error(response.statusText);
      return await response.text();
    } catch (ex) {
      if (ex.name === 'AbortError') {
        throw new Error('Timeout');
      } else {
        throw ex;
      }
    } finally {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
    }
  } else {
    try {
      return await new Promise((resolve, reject) => {
        fs.readFile(name, opts.encoding, (err, data) => {
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

export async function readParsable(name: string, opts: IReadOptions): Promise<string> {
  try {
    return await readFile(name, opts);
  } catch (ex) {
    throw new Error(`Could not parse ${name}: ${ex.message}`);
  }
}
