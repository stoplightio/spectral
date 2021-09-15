import { dirname, parse, join, normalize, isAbsolute, isURL } from '@stoplight/path';
import type { Plugin } from 'rollup';
import type { IO } from '../types';

export const virtualFs = ({ fs }: IO): Plugin => ({
  name: '@stoplight-spectral/virtual-fs',
  resolveId(source, importer) {
    const { protocol } = parse(source);

    if (protocol === 'http' || protocol === 'https') {
      return null;
    }

    if (protocol !== 'file' && !/^[./]/.test(source)) {
      return null;
    }

    if (isAbsolute(source)) {
      return normalize(source);
    }

    if (importer !== void 0) {
      return join(dirname(importer), source);
    }

    return source;
  },
  load(id) {
    if (!isURL(id)) {
      return fs.promises.readFile(id, 'utf8');
    }

    return;
  },
});
