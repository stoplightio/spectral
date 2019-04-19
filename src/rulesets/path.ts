const URL = require('url').URL;
import { dirname, resolve } from 'path';

export function resolvePath(from: string, to: string) {
  if (from.startsWith('http')) {
    return new URL(to, from).href;
  }
  return resolve(dirname(resolve(process.cwd(), from)), to);
}
