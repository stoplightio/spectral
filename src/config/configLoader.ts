import { join } from '@stoplight/path';
import * as fs from 'fs';
import { ConfigFormat, ILintConfig } from '../types/config';

const DEFAULT_RULESET_FILE = /^\.?spectral\.(?:ya?ml|json)$/;

export const createEmptyConfig = (): ILintConfig => ({
  encoding: 'utf8',
  format: ConfigFormat.STYLISH,
  verbose: false,
});

export const getDefaultRulesetFile = (directory: string): Promise<string | null> => {
  return new Promise(resolve => {
    fs.readdir(directory, (err, files) => {
      if (err === null) {
        for (const file of files) {
          if (DEFAULT_RULESET_FILE.test(file)) {
            resolve(join(directory, file));
            return;
          }
        }
      }

      resolve(null);
    });
  });
};
