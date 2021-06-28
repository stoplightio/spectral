import { fs } from 'memfs';
import * as path from 'path';
import * as prettier from 'prettier';

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
});
