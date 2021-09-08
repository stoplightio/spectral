import type { Plugin } from 'rollup';
import { isValidPackageName } from '../utils/isValidPackageName';
import { isURL } from '@stoplight/path';

const DATA_URIS = /^(?:data|node|file):/;

export const skypack = (): Plugin => ({
  name: '@stoplight-spectral/skypack',
  resolveId(id) {
    if (DATA_URIS.test(id) || isURL(id)) return;

    const path = id.split('/');
    if (path.length === 0) {
      return;
    }

    if (isValidPackageName(path[0])) {
      return `https://cdn.skypack.dev/${id}`;
    }

    return;
  },
});
