import type { Plugin } from 'rollup';
import { isPackageImport } from '../utils/isPackageImport';
import { isURL } from '@stoplight/path';

const DATA_URIS = /^(?:data|node|file):/;

export const skypack = (opts?: { ignoreList?: (string | RegExp)[] }): Plugin => {
  return <Plugin>{
    name: '@stoplight-spectral/skypack',
    resolveId(id) {
      if (DATA_URIS.test(id) || isURL(id)) return;

      const isIgnored =
        opts?.ignoreList !== void 0 &&
        opts.ignoreList.some(ignored => (typeof ignored === 'string' ? ignored === id : ignored.test(id)));

      if (!isIgnored && isPackageImport(id)) {
        return `https://cdn.skypack.dev/${id}`;
      }

      return;
    },
  };
};
