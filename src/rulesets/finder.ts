import * as path from '@stoplight/path';
import * as fs from 'fs';
import { rulesetsMap } from './map';

const SPECTRAL_SRC_ROOT = path.join(__dirname, '..');

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
    // todo: put hardcoded version here? might be good if we decide to make a breaking change in future.
    return path.join('https://unpkg.com/', to); // try to point to npm module
  }
}

function exists(uri: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    fs.access(uri, fs.constants.F_OK, err => {
      resolve(err === null);
    });
  });
}
