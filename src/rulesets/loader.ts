import { join } from '@stoplight/path';
import * as fs from 'fs';

const DEFAULT_RULESET_FILE = /^\.?spectral\.(?:ya?ml|json)$/;

export const isDefaultRulesetFile = (uri: string) => DEFAULT_RULESET_FILE.test(uri);

export const getDefaultRulesetFile = (directory: string): Promise<string | null> => {
  return new Promise(resolve => {
    fs.readdir(directory, (err, files) => {
      if (err === null) {
        for (const file of files) {
          if (isDefaultRulesetFile(file)) {
            resolve(join(directory, file));
            return;
          }
        }
      }

      resolve(null);
    });
  });
};
