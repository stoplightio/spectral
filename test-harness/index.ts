import * as path from '@stoplight/path';
import { normalize } from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import * as fg from 'fast-glob';
import * as fs from 'fs';
import * as tmp from 'tmp';
import { applyReplacements, normalizeLineEndings, parseScenarioFile, tmpFile } from './helpers';
import { spawnNode } from './spawn';
import nanoid = require('nanoid/non-secure');

const spectralBin = path.join(__dirname, '../packages/cli/binaries/spectral');
const cwd = path.join(__dirname, './scenarios');
const tmpCwd = path.join(__dirname, './tmp');
const files = process.env.TESTS !== void 0 ? String(process.env.TESTS).split(',') : fg.sync('**/*.scenario', { cwd });

describe('cli acceptance tests', () => {
  afterAll(async () => {
    await fs.promises.rmdir(tmpCwd, { recursive: true });
  });

  describe.each(files)('%s file', file => {
    const data = fs.readFileSync(path.join(cwd, file), { encoding: 'utf8' });
    const scenario = parseScenarioFile(data);
    const scenarioId = `${nanoid()}_${Date.now()}`;
    const scenarioCwd = path.join(tmpCwd, scenarioId);

    if (scenario.command === void 0) {
      test.todo(scenario.test);
      return;
    }

    const replacements: Dictionary<string> = {
      __dirname: scenarioCwd,
      bin: spectralBin,
      scenarioId,
    };

    const tmpFileHandles = new Map<string, tmp.FileResult>();

    beforeAll(async () => {
      await fs.promises.mkdir(scenarioCwd, { recursive: true });

      await Promise.all(
        scenario.assets.map(async ([asset]) => {
          const assetPath = asset.replace(/^asset:/, '');
          const tmpdir = path.dirname(assetPath);
          const tmpFileHandle = await tmpFile({
            name: path.basename(assetPath),
            tmpdir: path.join(scenarioCwd, tmpdir === '.' ? '.' : `${scenarioId}-${tmpdir}`),
          });

          tmpFileHandles.set(asset, tmpFileHandle);

          const normalizedName = normalize(tmpFileHandle.name);

          replacements[asset] = normalizedName;
          replacements[`${asset}|no-ext`] = normalizedName.replace(new RegExp(`${path.extname(normalizedName)}$`), '');
          replacements[`${asset}|filename|no-ext`] = path.basename(normalizedName, true);
        }),
      );

      await Promise.all(
        scenario.assets.map(async ([asset, contents]) => {
          const replaced = applyReplacements(contents, replacements);
          await fs.promises.writeFile(replacements[asset], replaced, {
            encoding: 'utf8',
          });
        }),
      );
    });

    afterAll(async () => {
      for (const { removeCallback } of tmpFileHandles.values()) {
        removeCallback();
      }

      tmpFileHandles.clear();

      await fs.promises.rmdir(scenarioCwd, { recursive: true });
    });

    test(scenario.test, async () => {
      const command = applyReplacements(scenario.command!, replacements);
      const { stderr, stdout, status } = await spawnNode(command, scenario.env, scenarioCwd);
      replacements.date = String(new Date()); // this may introduce random failures, but hopefully they don't occur too often

      const expectedStdout = scenario.stdout === void 0 ? void 0 : applyReplacements(scenario.stdout, replacements);
      const expectedStderr = scenario.stderr === void 0 ? void 0 : applyReplacements(scenario.stderr, replacements);

      if (expectedStderr !== void 0) {
        expect(stderr).toEqual(normalizeLineEndings(expectedStderr));
      } else if (stderr !== '') {
        throw new Error(stderr);
      }

      if (expectedStdout !== void 0) {
        expect(stdout).toEqual(normalizeLineEndings(expectedStdout));
      }

      if (scenario.status !== void 0) {
        expect(`status:${status}`).toEqual(`status:${scenario.status}`);
      }
    });
  });
});
