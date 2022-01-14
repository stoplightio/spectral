import * as path from '@stoplight/path';
import * as fs from 'fs';
import { migrateRuleset } from '../index';

describe('migrator', () => {
  describe('node_modules resolution', () => {
    const cwd = path.join(__dirname, '.cache');
    const name = 'my-npm-ruleset';

    beforeAll(async () => {
      const pkgRoot = path.join(cwd, 'node_modules', name);
      await fs.promises.mkdir(pkgRoot, { recursive: true });
      await fs.promises.writeFile(
        path.join(pkgRoot, 'package.json'),
        JSON.stringify({
          name,
          main: './index.json',
        }),
      );
      await fs.promises.writeFile(
        path.join(pkgRoot, 'index.json'),
        JSON.stringify({
          functions: ['test'],
          rules: {
            test: {
              given: '$',
              then: {
                function: 'test',
              },
            },
          },
        }),
      );
    });

    afterAll(async () => {
      await fs.promises.rmdir(cwd, { recursive: true });
    });

    it('should be supported', async () => {
      await fs.promises.writeFile(
        path.join(cwd, 'my-ruleset.json'),
        JSON.stringify({
          extends: [name],
          formats: ['oas2'],
          rules: {
            rule: {
              then: {
                given: '$',
                function: 'truthy',
              },
            },
          },
        }),
      );

      expect(
        await migrateRuleset(path.join(cwd, 'my-ruleset.json'), {
          format: 'esm',
          fs: {
            promises: {
              readFile: fs.promises.readFile,
            },
          },
        }),
      ).toEqual(`import {oas2} from "@stoplight/spectral-formats";
import {truthy} from "@stoplight/spectral-functions";
import test from "${cwd}/node_modules/my-npm-ruleset/functions/test.js";
export default {
  "extends": [{
    "rules": {
      "test": {
        "given": "$",
        "then": {
          "function": test
        }
      }
    }
  }],
  "formats": [oas2],
  "rules": {
    "rule": {
      "then": {
        "given": "$",
        "function": truthy
      }
    }
  }
};
`);
    });
  });
});
