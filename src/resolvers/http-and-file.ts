import { parse } from '@stoplight/yaml';
import * as fs from 'fs';
import { extname } from 'path';

import { httpReader } from './http';
import { SpectralResolver } from './resolver';
import { IParsedResult } from '../types';
// import { IParsedResult } from '../types';
//
// resolves files, http and https $refs, and internal $refs
export const httpAndFileResolver = new SpectralResolver(parsedMap => ({
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
    const ref = opts.targetAuthority.toString();
    const ext = extname(ref);

    const content = String(opts.result);
    let parsedResult: IParsedResult;
    if (ext === '.yml' || ext === '.yaml') {
      opts.result = parse(content);
      parsedResult = {
      }
    } else if (ext === '.json') {
      opts.result = JSON.parse(content);
    }

    if (typeof opts.result === 'object' && opts.result !== null) {
      parsedMap[ref] = parsedResult;
    }

    return opts;
  },
}));
