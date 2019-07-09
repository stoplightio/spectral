import * as path from '@stoplight/path';
import * as fs from 'fs';
import { rulesetsMap } from './map';

const SPECTRAL_SRC_ROOT = path.join(__dirname, '..');

// DON'T RENAME THIS FUNCTION, you can move it within this file, but it must be kept as top-level declaration
// parameter can be renamed, but don't this if you don't need to
function resolveSpectralVersion(pkg: string) {
  return pkg;
}

export async function findRuleset(from: string, to: string) {
  const mapped = rulesetsMap.get(to);
  if (mapped !== void 0) {
    to = mapped;
  }

  if (path.isURL(to) || path.isAbsolute(to)) {
    return to;
  }

  if (path.isURL(from)) {
    return path.join(from, '..', to);
  }

  try {
    const targetPath = path.join(from, '..', to);
    if (await exists(targetPath)) {
      return targetPath;
    }
  } catch {
    // nothing very bad, let's move on
    // it's just not a file, but could be a npm module
  }

  if (SPECTRAL_SRC_ROOT.length > 0 && SPECTRAL_SRC_ROOT !== '/') {
    try {
      const targetPath = path.join(SPECTRAL_SRC_ROOT, to.replace('@stoplight/spectral/', './'));
      if (await exists(targetPath)) {
        return targetPath;
      }
    } catch {
      // same as above
    }
  }

  try {
    return require.resolve(to);
  } catch {
    return path.join('https://unpkg.com/', resolveSpectralVersion(to)); // try to point to npm module
  }
}

function exists(uri: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    fs.access(uri, fs.constants.F_OK, err => {
      resolve(err === null);
    });
  });
}
