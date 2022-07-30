import * as path from '@stoplight/path';
import * as swc from '@swc/core';
import fg from 'fast-glob';
import * as fileEntryCache from 'file-entry-cache';
import * as _fs from 'fs';

const { promises: fs } = _fs;

import { applyReplacements } from '../src/utils';
import { IScenarioFile, parseScenarioFile } from '../src/parser';

const OUT_DIR = path.join(__dirname, '../tests');
const SCENARIOS_DIR = path.join(__dirname, '../scenarios');

async function loadAssets(cwd: string, env: Record<string, string>, scenario: IScenarioFile): Promise<void> {
  await Promise.all(
    (
      await Promise.all(
        scenario.assets.map(async ([asset, content]) => {
          const assetPath = asset.replace(/^asset:/, '');
          const filepath = path.join(cwd, assetPath);
          await fs.mkdir(path.dirname(filepath), { recursive: true });
          const filename = path.basename(assetPath);

          env[asset] = filepath;
          env[`${asset}|no-ext`] = filepath.slice(0, -path.extname(filename).length);
          env[`${asset}|filename|no-ext`] = filename;

          return [filepath, content];
        }),
      )
    ).map(([filepath, content]) => fs.writeFile(filepath, applyReplacements(content, env))),
  );
}

function getChangedScenarios(changedFiles: string[], scenarios: string[]): string[] {
  return Array.from(
    new Set([
      ...changedFiles
        .map(changedFile =>
          changedFile.startsWith(SCENARIOS_DIR)
            ? changedFile
            : `${path.dirname(changedFile.replace(OUT_DIR, SCENARIOS_DIR))}.scenario`,
        )
        .filter(scenario => scenarios.includes(scenario)),
    ]),
  );
}

(async () => {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const scenarios = await fg('**/*.scenario', { cwd: SCENARIOS_DIR, absolute: true });
  const cache = fileEntryCache.create('spectral-test-harness', path.join(__dirname, '../../.cache'), true);
  const changedFiles = cache.getUpdatedFiles([...scenarios, ...(await fg('**/**', { cwd: OUT_DIR, absolute: true }))]);
  const changedScenarios = getChangedScenarios(changedFiles, scenarios);

  await Promise.all(
    Array.from(changedScenarios).map(async file => {
      const scenario = {
        id: file,
        path: path.join(
          __dirname,
          '../tests',
          file.slice(path.join(__dirname, '../scenarios').length + 1, -path.basename(file).length),
          path.basename(file, true),
        ),
        ...parseScenarioFile(await fs.readFile(file, 'utf8')),
      };

      await fs.mkdir(scenario.path, { recursive: true });

      const env: Record<string, string> = {
        __dirname: scenario.path,
        bin: path.join(__dirname, '../../packages/cli/binaries/spectral'),
        ...scenario.env,
      };

      await loadAssets(env.__dirname, env, scenario);

      if (scenario.command !== null) {
        scenario.command = applyReplacements(scenario.command, env);
      }

      const { code } = await swc.transformFile(path.join(__dirname, '../src/suite.ts'), {
        sourceMaps: false,
        jsc: {
          parser: {
            syntax: 'typescript',
          },
          target: 'es2021',
          minify: {
            compress: {
              booleans: false,
              conditionals: false,
              join_vars: false,
            },
          },
          transform: {
            optimizer: {
              simplify: true,
              globals: {
                vars: {
                  scenario: JSON.stringify(
                    {
                      ...scenario,
                      aliases: null,
                      assets: null,
                      env: env,
                    },
                    null,
                    2,
                  ),
                },
              },
            },
          },
        },
      });

      await fs.writeFile(path.join(scenario.path, `${path.basename(file, true)}.test.js`), code);
    }),
  );

  cache.reconcile(true);
})();
