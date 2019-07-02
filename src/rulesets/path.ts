import * as path from '@stoplight/path';
import { PROJECT_ROOT } from '../consts';
import { rulesetsMap } from './map';

export function resolvePath(from: string, to: string) {
  const mapped = rulesetsMap.get(to);
  if (mapped !== void 0) {
    to = mapped;
  }

  if (path.isURL(to) || path.isAbsolute(to)) {
    return to;
  }

  if (to.startsWith('@stoplight/spectral/')) {
    try {
      return to.replace('@stoplight/spectral/', require.resolve('@stoplight/spectral'));
    } catch {
      return to.replace('@stoplight/spectral/', `${PROJECT_ROOT}/`);
    }
  }

  return path.join(from, to);
}
