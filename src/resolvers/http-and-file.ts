import { getLocationForJsonPath as getLocationForJsonPathJSON } from '@stoplight/json/getLocationForJsonPath';
import { parseWithPointers as parseJSONWithPointers } from '@stoplight/json/parseWithPointers';
import { parseWithPointers as parseYAMLWithPointers } from '@stoplight/yaml';
import { getLocationForJsonPath as getLocationForJsonPathYAML } from '@stoplight/yaml';
import * as fs from 'fs';
import { extname } from 'path';

import { IParsedResult } from '../types';
import { httpReader } from './http';
import { SpectralResolver } from './resolver';

export const ANNOTATION = Symbol('annotation');

// resolves files, http and https $refs, and internal $refs
export const httpAndFileResolver = new SpectralResolver(process => ({
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
    let parsedResult: IParsedResult | void;
    if (ext === '.yml' || ext === '.yaml') {
      parsedResult = {
        // todo: print diagnostics
        parsed: parseYAMLWithPointers(content),
        source: ref,
        getLocationForJsonPath: getLocationForJsonPathYAML,
      };
    } else if (ext === '.json') {
      parsedResult = {
        // todo: print diagnostics
        parsed: parseJSONWithPointers(content),
        source: ref,
        getLocationForJsonPath: getLocationForJsonPathJSON,
      };
    }

    if (parsedResult !== undefined) {
      opts.result = parsedResult.parsed.data;
      process(parsedResult, opts);
    }

    return opts;
  },
}));
