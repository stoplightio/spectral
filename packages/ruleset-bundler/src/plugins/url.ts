import { isURL, isAbsolute, join, dirname } from '@stoplight/path';
import type { Plugin } from 'rollup';
import type { IO } from '../types';

export const url = ({ fetch }: IO): Plugin => ({
  name: '@stoplight-spectral/url',
  async resolveId(id, importer) {
    const resolved = await this.resolve(id, importer, {
      skipSelf: true,
    });

    if (resolved?.external === true) {
      return;
    }

    if (isURL(id)) {
      return id;
    }

    if (importer !== void 0 && isURL(importer)) {
      const url = new URL(importer);
      // we change https://cdn.skypack.dev/{name-of-the-package}
      // to https://cdn.skypack.dev/-/lodash@v4.17.21-K6GEbP02mWFnLA45zAmi/dist=es2020,mode=imports/optimized/lodash.js
      if (isAbsolute(id)) {
        url.pathname = id;
      } else {
        url.pathname = join(dirname(url.pathname), id);
      }

      return String(url);
    }

    return;
  },
  async load(id) {
    if (!isURL(id)) return;
    const res = await fetch(id);
    if (!res.ok) {
      throw Error(`Error fetching ${id}: ${res.statusText}`);
    }

    return res.text();
  },
});
