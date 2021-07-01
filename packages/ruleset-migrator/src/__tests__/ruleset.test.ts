import { fs } from 'memfs';
import * as path from 'path';
import * as prettier from 'prettier';

import { migrateRuleset } from '..';
import * as fixtures from './__fixtures__/.cache/index.json';

const cwd = '/.tmp/spectral';

describe('migrator', () => {
  let randomSpy: jest.SpyInstance;

  beforeAll(async () => {
    await fs.promises.mkdir(cwd, { recursive: true });
  });

  beforeEach(() => {
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  afterAll(() => {
    fs.rmdirSync(cwd, { recursive: true });
  });

  describe.each<[string, Record<string, string>]>([...Object.entries(fixtures)])('%s', (name, entries) => {
    const dir = path.join(cwd, name);
    const ruleset = path.join(dir, 'ruleset');

    beforeAll(async () => {
      await fs.promises.mkdir(dir, { recursive: true });
      for (const [name, content] of Object.entries(entries)) {
        await fs.promises.writeFile(path.join(dir, name), content);
      }
    });

    afterAll(() => {
      fs.rmdirSync(dir, { recursive: true });
    });

    it.each<[format: 'commonjs' | 'esm', ext: string]>([
      ['commonjs', '.cjs'],
      ['esm', '.mjs'],
    ])('given %s format, should generate a valid bundle', async (format, ext) => {
      expect(
        prettier.format(
          await migrateRuleset(ruleset, {
            cwd,
            format,
            fs: fs as any,
          }),
          { parser: 'babel' },
        ),
      ).toEqual(await fs.promises.readFile(path.join(dir, `output${ext}`), 'utf8'));
    });
  });

  describe('error handling', () => {
    it('given unknown format, should throw', async () => {
      await fs.promises.writeFile(path.join(cwd, 'unknown-format.json'), `{ "formats": ["json-schema-draft-2"] }`);
      await expect(
        migrateRuleset(path.join(cwd, 'unknown-format.json'), {
          cwd,
          format: 'esm',
          fs: fs as any,
        }),
      ).rejects.toThrow('Invalid ruleset provided');
    });
  });

  describe('custom npm registry', () => {
    it('should be supported', async () => {
      await fs.promises.writeFile(
        path.join(cwd, 'custom-npm-provider.json'),
        JSON.stringify({
          extends: 'spectral:asyncapi',
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
        await migrateRuleset(path.join(cwd, 'custom-npm-provider.json'), {
          cwd,
          format: 'esm',
          fs: fs as any,
          npmRegistry: 'https://unpkg.com/',
        }),
      ).toEqual(`import {asyncapi} from "https://unpkg.com/@stoplight/spectral-rulesets";
import {oas2} from "https://unpkg.com/@stoplight/spectral-formats";
import {truthy} from "https://unpkg.com/@stoplight/spectral-functions";
export default {
  "extends": asyncapi,
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

    it('should not apply to custom functions', async () => {
      await fs.promises.writeFile(
        path.join(cwd, 'custom-npm-provider-custom-functions.json'),
        JSON.stringify({
          functions: ['customFunction'],
          rules: {
            rule: {
              then: {
                given: '$',
                function: 'customFunction',
              },
            },
          },
        }),
      );
      expect(
        await migrateRuleset(path.join(cwd, 'custom-npm-provider-custom-functions.json'), {
          cwd,
          format: 'esm',
          fs: fs as any,
          npmRegistry: 'https://unpkg.com/',
        }),
      ).toEqual(`import customFunction from "./functions/customFunction.js";
export default {
  "rules": {
    "rule": {
      "then": {
        "given": "$",
        "function": customFunction
      }
    }
  }
};
`);
    });
  });
});
