import * as path from '@stoplight/path';
import * as fs from 'fs';
import { RESOLVE_ALIASES, STATIC_ASSETS } from '../assets';

// DON'T RENAME THIS FUNCTION, you can move it within this file, but it must be kept as top-level declaration
// parameter can be renamed, but don't this if you don't need to
function resolveSpectralVersion(pkg: string) {
  return pkg;
}

function resolveFromNPM(pkg: string) {
  try {
    return require.resolve(pkg);
  } catch {
    return path.join('https://unpkg.com/', resolveSpectralVersion(pkg));
  }
}

async function resolveFromFS(from: string, to: string) {
  let targetPath: string;

  targetPath = path.resolve(from, to);

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
  const mapped = RESOLVE_ALIASES.get(to);

  if (mapped !== void 0) {
    return mapped;
  }

  if (path.isAbsolute(to)) {
    return to;
  }

  if (path.isURL(from)) {
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
    fs.access(uri, fs.constants.F_OK, err => {
      resolve(err === null);
    });
  });
}
