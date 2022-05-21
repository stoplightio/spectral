import type { Plugin } from 'rollup';
import { isPackageImport } from '../utils/isPackageImport';
import { isURL } from '@stoplight/path';

const DATA_URIS = /^(?:data|node|file):/;

export const skypack = (): Plugin => ({
  name: '@stoplight-spectral/skypack',
  resolveId(id) {
    if (DATA_URIS.test(id) || isURL(id)) return;

    if (isPackageImport(id)) {
      return `https://cdn.skypack.dev/${id}`;
    }

    return;
  },
});
