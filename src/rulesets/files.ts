import * as path from '@stoplight/path';
import * as fs from 'fs';
import { IReadOptions, readParsable } from '../fs/reader';
import { IRuleset } from '../types/ruleset';

const SPECTRAL_SRC_ROOT = path.join(__dirname, '..');

function resolveFromNPM(pkg: string) {
  try {
    return require.resolve(pkg);
  } catch {
    return path.join('https://unpkg.com/', pkg);
  }
}

async function resolveFromFS(from: string, to: string) {
  let targetPath: string;

  // if a built-in ruleset starting with @stoplight/spectral is given,
  // try to search in spectral source directory - we should be able to find it
  // this path is often hit when spectral:oas(?:2|3)? shorthand is provided
  if (SPECTRAL_SRC_ROOT.length > 0 && SPECTRAL_SRC_ROOT !== '/' && to.startsWith('@stoplight/spectral')) {
    targetPath = path.join(SPECTRAL_SRC_ROOT, to.replace('@stoplight/spectral/', './'));
    if (await exists(targetPath)) {
      return targetPath;
    }
  }

  targetPath = path.resolve(from, to);
  // if it's not a built-in ruleset, try to resolve the file according to the provided path
  if (await exists(targetPath)) {
    return targetPath;
  }

  throw new Error('File does not exist');
}

export async function resolveFile(base: string, pathname: string) {
  const mapped = builtInRulesets.get(pathname);

  if (mapped !== void 0) {
    return mapped;
  }

  if (path.isAbsolute(pathname)) {
    return pathname;
  }

  if (path.isURL(base)) {
    return path.join(base, pathname);
  }

  try {
    return await resolveFromFS(base, pathname);
  } catch {
    // fs lookup failed...
    // we either given a npm module or th e code is executed in a browser or other environment without fs access
    return resolveFromNPM(pathname);
  }
}

export async function getRulesetFile(base: string, pathname: string, opts: IReadOptions) {
  const mapped = builtInRulesets.get(pathname);

  if (mapped !== void 0 && typeof mapped === 'object') {
    return mapped;
  }

  return await readParsable(await resolveFile(base, pathname), opts);
}

function exists(uri: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    fs.access(uri, fs.constants.F_OK, err => {
      resolve(err === null);
    });
  });
}

export const builtInRulesets = new Map<string, IRuleset>([
  ['spectral:oas', require('./oas/index.json')],
  ['spectral:oas2', require('./oas2/index.json')],
  ['spectral:oas3', require('./oas3/index.json')],
]);
