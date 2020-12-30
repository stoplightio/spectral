import { isURL } from '@stoplight/path';
import AbortController from 'abort-controller';
import * as fs from 'fs';
import { RequestInit } from 'node-fetch';
import { STATIC_ASSETS } from '../assets';
import request from '../request';
import { Agent } from 'http';

export interface IFileReadOptions {
  encoding: string;
}

export interface IReadOptions extends IFileReadOptions {
  timeout?: number;
  agent?: Agent;
}

export async function readFile(name: string, opts: IReadOptions): Promise<string> {
  if (name in STATIC_ASSETS) {
    return STATIC_ASSETS[name];
  } else if (isURL(name)) {
    let response;
    let timeout: NodeJS.Timeout | number | null = null;
    try {
      const requestOpts: RequestInit = {};
      requestOpts.agent = opts.agent;
      if (opts.timeout !== void 0) {
        const controller = new AbortController();
        timeout = setTimeout(() => {
          controller.abort();
        }, opts.timeout);
        requestOpts.signal = controller.signal;
      }

      response = await request(name, requestOpts);

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
