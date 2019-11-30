#!/usr/bin/env node
import { basename, dirname, join } from '@stoplight/path';
import * as fg from 'fast-glob';
import * as fs from 'fs';

import { parseScenarioFile } from '../helpers';
import { FIXTURES_ROOT, SCENARIOS_ROOT, TESTS_ROOT } from './consts';
import { generate } from './generate';

fs.mkdirSync(TESTS_ROOT, { recursive: true });
fs.mkdirSync(FIXTURES_ROOT, { recursive: true });

(async () => {
  const stream = fg.stream('**/*.scenario', { cwd: SCENARIOS_ROOT });

  for await (const entry of stream) {
    const scenarioPath = join(SCENARIOS_ROOT, entry as string);
    const source = await fs.promises.readFile(scenarioPath, 'utf8');
    const scenario = parseScenarioFile(source);
    const assets = scenario.assets === void 0 ? [] : await writeAssets(entry as string, scenario.assets);

    const testFilename = `${basename(entry as string, true)}.test.ts`;
    const testRoot = await getDirectory(entry as string, TESTS_ROOT);

    const code = generate({
      assets,
      scenario,
      scenarioName: entry as string,
    });

    await fs.promises.writeFile(join(testRoot, testFilename), code);
  }
})();

async function writeAssets(scenario: string, assets: string[][]) {
  const list = [];
  const promises: Array<Promise<void>> = [];

  for (const [name, content] of assets) {
    const filename = `${scenario}-${name.replace(/:/g, '-')}`;

    const testFilename = basename(filename);
    list.push([name, filename]);

    promises.push(
      getDirectory(scenario, FIXTURES_ROOT).then(testRoot =>
        fs.promises.writeFile(join(testRoot, testFilename), content),
      ),
    );
  }

  await Promise.all(promises);
  return list;
}

async function getDirectory(entry: string, dir: string): Promise<string> {
  const entryDirname = dirname(entry);

  if (entryDirname !== '.') {
    dir = join(dir, entryDirname);
    await fs.promises.mkdir(dir, { recursive: true });
  }

  return dir;
}
