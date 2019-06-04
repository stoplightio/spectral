import { Resolver } from '@stoplight/json-ref-resolver';
import * as fs from 'fs';

import { httpReader } from './http';

// resolves files, http and https $refs, and internal $refs
export const httpAndFileResolver = new Resolver({
  readers: {
    https: httpReader,
    http: httpReader,
    file: {
      read(ref: any) {
        return new Promise((resolve, reject) => {
          const path = ref.path();
          return fs.readFile(path, 'utf8', (err, data) => {
            if (err) reject(err);
            resolve(data);
          });
        });
      },
    },
  },
});
