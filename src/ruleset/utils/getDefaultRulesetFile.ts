import { join } from '@stoplight/path';
import * as fs from 'fs';
import { isDefaultRulesetFile } from './isDefaultRulesetFile';

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
