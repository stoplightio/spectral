import * as path from '@stoplight/path';
import * as fs from 'fs';
import { RESOLVE_ALIASES, STATIC_ASSETS } from '../assets';

const NPM_PKG_ROOT = 'https://unpkg.com/';
const SPECTRAL_PKG_NAME = '@stoplight/spectral';

// let's point at dist directory that has all relevant files (including custom functions) transpiled
const SPECTRAL_SRC_ROOT = path.join(__dirname, '../../dist');
// DON'T RENAME THIS FUNCTION, you can move it within this file, but it must be kept as top-level declaration
// parameter can be renamed, but don't this if you don't need to
function resolveSpectralVersion(pkg: string) {
  return pkg;
}

function resolveFromNPM(pkg: string) {
  try {
    return require.resolve(pkg);
  } catch {
    return path.join(NPM_PKG_ROOT, resolveSpectralVersion(pkg));
  }
}

export function isNPMSource(src: string) {
  return src.startsWith(NPM_PKG_ROOT) && !src.includes(`${NPM_PKG_ROOT}${SPECTRAL_PKG_NAME}`); // we ignore spectral on purpose, since they undergo a slightly different process
}

async function resolveFromFS(from: string, to: string) {
  let targetPath: string;

  // if a built-in ruleset starting with @stoplight/spectral is given,
  // try to search in spectral source directory - we should be able to find it
  // this path is often hit when a built-in ruleset shorthand is provided
  if (SPECTRAL_SRC_ROOT.length > 0 && SPECTRAL_SRC_ROOT !== '/' && to.startsWith(SPECTRAL_PKG_NAME)) {
    targetPath = path.join(SPECTRAL_SRC_ROOT, to.replace(SPECTRAL_PKG_NAME, './'));
    if (await exists(targetPath)) {
      return targetPath;
    }
  }

  targetPath = path.resolve(from, to);

  // if found in static assets, it's fine, as readParsable will handle it just fine
  if (targetPath in STATIC_ASSETS) {
    return targetPath;
  }

  // if it's not a built-in ruleset, try to resolve the file according to the provided path
  if (await exists(targetPath)) {
    return targetPath;
  }

  throw new Error('File does not exist');
}

export async function findFile(from: string, to: string) {
  const mapped = RESOLVE_ALIASES[to];

  if (mapped !== void 0) {
    to = mapped;
  }

  if (to in STATIC_ASSETS) {
    return to;
  }

  if (path.isAbsolute(to)) {
    return to;
  }

  if (path.isURL(from) && mapped === void 0) {
    return path.join(from, to);
  }

  try {
    return await resolveFromFS(from, to);
  } catch {
    // fs lookup failed...
    // we either given a npm module or the code is executed in a browser or other environment without fs access
    return resolveFromNPM(to);
  }
}

function exists(uri: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    fs.stat(uri, err => {
      resolve(err === null);
    });
  });
}
