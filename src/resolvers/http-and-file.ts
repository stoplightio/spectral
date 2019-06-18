import { Resolver } from '@stoplight/json-ref-resolver';
import { parseWithPointers } from '@stoplight/yaml';
import * as fs from 'fs';

import { httpReader } from './http';

// resolves files, http and https $refs, and internal $refs
export const httpAndFileResolver = new Resolver({
  resolvers: {
    https: httpReader,
    http: httpReader,
    file: {
      resolve(ref: any) {
        return new Promise((resolve, reject) => {
          const path = ref.path();
          fs.readFile(path, 'utf8', (err, data) => {
            if (err) reject(err);
            resolve(data);
          });
        });
      },
    },
  },

  parseResolveResult: async opts => {
    const parts = opts.targetAuthority.path().split('.');
    const format = parts[parts.length - 1];

    if (format === 'yml' || format === 'yaml') {
      opts.result = parseWithPointers(opts.result).data;
    } else if (format === 'json') {
      opts.result = JSON.parse(opts.result);
    }

    return opts;
  },
});
