import * as path from 'path';
import { PROJECT_ROOT } from '../consts';
import { isURL } from '../fs/reader';

export function resolvePath(from: string, to: string) {
  if (isURL(to) || path.isAbsolute(to)) {
    return to;
  }

  if (to.startsWith('@stoplight/spectral/')) {
    try {
      return to.replace('@stoplight/spectral/', require.resolve('@stoplight/spectral'));
    } catch {
      return to.replace('@stoplight/spectral/', `${PROJECT_ROOT}/`);
    }
  }

  return path.join(from, to).replace(/(https?:\/)([^\/])/, '$1/$2'); // todo: use stoplight/path
}
