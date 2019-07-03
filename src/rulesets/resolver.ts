import * as path from '@stoplight/path';
import * as fs from 'fs';
import { rulesetsMap } from './map';

export async function resolvePath(from: string, to: string) {
  const mapped = rulesetsMap.get(to);
  if (mapped !== void 0) {
    to = mapped;
  }

  if (path.isURL(to) || path.isAbsolute(to)) {
    return to;
  }

  if (path.isURL(from)) {
    return path.join(from, to);
  }

  try {
    const targetPath = path.join(from, to);
    await new Promise((reject, resolve) => {
      fs.stat(targetPath, err => {
        if (err !== null) {
          reject();
        } else {
          resolve();
        }
      });
    });

    // it's very likely to be Node.js env or browser/worker env where the file is accessible cause it's a part of project
    return targetPath;
  } catch {
    try {
      require(to);
      return require.resolve(to);
    } catch {
      return path.join('https://unpkg.com/', to); // try to point to npm module
    }
  }
}
