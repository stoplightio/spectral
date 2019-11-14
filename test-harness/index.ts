import * as path from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import * as fg from 'fast-glob';
import * as fs from 'fs';
import * as tmp from 'tmp';
import { promisify } from 'util';
import { applyReplacements, parseScenarioFile, tmpFile } from './helpers';
import { spawnNode } from './spawn';
const writeFileAsync = promisify(fs.writeFile);

const spectralBin = path.join(__dirname, '../binaries/spectral');
const cwd = path.join(__dirname, './scenarios');
const files = process.env.TESTS ? String(process.env.TESTS).split(',') : fg.sync('**/*.scenario', { cwd });

describe('cli acceptance tests', () => {
  describe.each(files)('%s file', file => {
    const data = fs.readFileSync(path.join(cwd, file), { encoding: 'utf8' });
    const scenario = parseScenarioFile(data);
    const replacements: Dictionary<string> = {
      __dirname,
      spectral: spectralBin,
    };

    const tmpFileHandles = new Map<string, tmp.FileResult>();

    beforeAll(async () => {
      const assets = Array.isArray(scenario.document) ? scenario.document : [];

      await Promise.all(
        assets.map(async ([asset, contents]) => {
          const tmpFileHandle = await tmpFile();
          tmpFileHandles.set(asset, tmpFileHandle);

          replacements[asset] = tmpFileHandle.name;
          replacements[`${asset}|no-ext`] = tmpFileHandle.name.replace(
            new RegExp(`${path.extname(tmpFileHandle.name)}$`),
            '',
          );

          await writeFileAsync(tmpFileHandle.name, contents, { encoding: 'utf8' }); // todo: apply replacements to contents
        }),
      );
    });

    afterAll(() => {
      for (const { removeCallback } of tmpFileHandles.values()) {
        removeCallback();
      }

      tmpFileHandles.clear();
    });

    test(scenario.test, async () => {
      const command = applyReplacements(scenario.command, replacements);
      const { stderr, stdout, status } = await spawnNode(command, scenario.env);

      const expectedStdout =
        scenario.stdout === void 0 ? void 0 : applyReplacements(scenario.stdout.trim(), replacements);
      const expectedStderr =
        scenario.stderr === void 0 ? void 0 : applyReplacements(scenario.stderr.trim(), replacements);

      if (expectedStderr !== void 0) {
        expect(stderr).toEqual(expectedStderr);
      } else if (stderr) {
        throw new Error(stderr);
      }

      if (expectedStdout !== void 0) {
        expect(stdout).toEqual(expectedStdout);
      }

      if (scenario.status !== void 0) {
        expect(`status:${status}`).toEqual(`status:${scenario.status}`);
      }
    });
  });
});
