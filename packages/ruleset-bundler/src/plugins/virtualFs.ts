import { dirname, parse, join, normalize, isAbsolute, isURL } from '@stoplight/path';
import type { Plugin } from 'rollup';
import type { IO } from '../types';

export const virtualFs = ({ fs }: IO): Plugin => {
  const recognized = new Set();

  return {
    name: '@stoplight-spectral/virtual-fs',

    resolveId(source, importer): string | null {
      const { protocol } = parse(source);

      if (protocol === 'http' || protocol === 'https') {
        return null;
      }

      if (protocol !== 'file' && !/^[./]/.test(source)) {
        return null;
      }

      let resolvedSource = source;

      if (isAbsolute(source)) {
        resolvedSource = normalize(source);
      } else if (importer !== void 0) {
        resolvedSource = join(dirname(importer), source);
      }

      recognized.add(resolvedSource);

      return resolvedSource;
    },
    load(id): Promise<string> | undefined {
      if (!isURL(id) && recognized.has(id)) {
        return fs.promises.readFile(id, 'utf8');
      }

      return;
    },
  };
};
