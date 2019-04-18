import { dirname, resolve } from 'path';

export function resolvePath(from: string, to: string) {
  return resolve(dirname(resolve(process.cwd(), from)), to);
}
