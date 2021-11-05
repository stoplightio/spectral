import { fs } from 'memfs';
import * as path from 'path';
import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/parser-babel';
import { Ruleset } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';
import * as fetchMock from 'fetch-mock';

import { migrateRuleset } from '..';
import * as fixtures from './__fixtures__/.cache/index.json';

const cwd = '/.tmp/spectral';

describe('migrator', () => {
  beforeAll(async () => {
    await fs.promises.mkdir(cwd, { recursive: true });
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
        await fs.promises.mkdir(path.join(dir, path.dirname(name)), { recursive: true });
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
            format,
            fs: fs as any,
          }),
          { parser: 'babel', plugins: [parserBabel] },
        ),
      ).toEqual(await fs.promises.readFile(path.join(dir, `output${ext}`), 'utf8'));
    });
  });

  it('should support subsequent migrations', async () => {
    await fs.promises.writeFile(
      path.join(cwd, 'ruleset-migration-1.json'),
      JSON.stringify({
        extends: ['./ruleset-migration-2.json'],
        rules: {
          'valid-type': 'error',
        },
      }),
    );

    await fs.promises.writeFile(
      path.join(cwd, 'ruleset-migration-2.json'),
      JSON.stringify({
        extends: 'spectral:oas',
        rules: {
          'valid-type': {
            given: '$',
            then: {
              function: 'truthy',
            },
          },
        },
      }),
    );

    const _module: { exports?: any } = {};

    await (async () => void 0).constructor(
      'module, require',
      await migrateRuleset(path.join(cwd, 'ruleset-migration-1.json'), {
        format: 'commonjs',
        fs: fs as any,
      }),
    )(_module, (id: string): unknown => {
      switch (id) {
        case '@stoplight/spectral-functions':
          return require('@stoplight/spectral-functions') as unknown;
        case '@stoplight/spectral-rulesets':
          return require('@stoplight/spectral-rulesets') as unknown;
        default:
          throw new ReferenceError(`${id} not found`);
      }
    });

    const ruleset = new Ruleset(_module.exports);

    expect(Object.keys(ruleset.rules)).toEqual([
      ...Object.keys(require('@stoplight/spectral-rulesets').oas.rules),
      'valid-type',
    ]);

    expect(ruleset.rules['valid-type'].severity).toEqual(DiagnosticSeverity.Error);
  });

  it('should accept custom fetch implementation', async () => {
    // something is off with default module interop in Karma :man_shrugging:
    const fetch = ((fetchMock as { default?: typeof import('fetch-mock') }).default ?? fetchMock).sandbox();

    await fs.promises.writeFile(
      path.join(cwd, 'ruleset.json'),
      JSON.stringify({
        extends: ['https://spectral.stoplight.io/ruleset'],
        rules: {
          'valid-type': 'error',
        },
      }),
    );

    fetch.get('https://spectral.stoplight.io/ruleset', {
      body: {
        rules: {
          'valid-type': {
            given: '$',
            function: {
              then: 'truthy',
            },
          },
        },
      },
    });

    expect(
      await migrateRuleset(path.join(cwd, 'ruleset.json'), {
        format: 'esm',
        fs: fs as any,
        fetch,
      }),
    ).toEqual(`export default {
  "extends": [{
    "rules": {
      "valid-type": {
        "given": "$",
        "function": {
          "then": "truthy"
        }
      }
    }
  }],
  "rules": {
    "valid-type": "error"
  }
};
`);
  });

  describe('error handling', () => {
    it('given unknown format, should throw', async () => {
      await fs.promises.writeFile(path.join(cwd, 'unknown-format.json'), `{ "formats": ["json-schema-draft-2"] }`);
      await expect(
        migrateRuleset(path.join(cwd, 'unknown-format.json'), {
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
          format: 'esm',
          fs: fs as any,
          npmRegistry: 'https://unpkg.com/',
        }),
      ).toEqual(`import customFunction from "/.tmp/spectral/functions/customFunction.js";
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

    it('should not apply to custom functions living outside of cwd', async () => {
      await fs.promises.writeFile(
        path.join(cwd, 'custom-npm-provider-custom-functions.json'),
        JSON.stringify({
          functionsDir: '../fns',
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
          format: 'esm',
          fs: fs as any,
          npmRegistry: 'https://unpkg.com/',
        }),
      ).toEqual(`import customFunction from "/.tmp/fns/customFunction.js";
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

    it('given commonjs output format, should be unsupported', async () => {
      await expect(
        migrateRuleset(
          path.join(cwd, 'custom-npm-provider-custom-functions.json'),
          // @ts-expect-error: npmRegistry not accepted
          {
            format: 'commonjs',
            fs: fs as any,
            npmRegistry: 'https://unpkg.com/',
          },
        ),
      ).rejects.toThrowError("'npmRegistry' option must not be used with commonjs output format.");
    });
  });
});
