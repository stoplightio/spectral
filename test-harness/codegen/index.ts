#!/usr/bin/env node
import { basename, dirname, join } from '@stoplight/path';
import * as fg from 'fast-glob';
import * as fs from 'fs';
const uniqueSlug = require('unique-slug');

import { parseScenarioFile } from '../helpers';
import { FIXTURES_ROOT, SCENARIOS_ROOT, TESTS_ROOT } from './consts';
import { generate } from './generate';

fs.mkdirSync(TESTS_ROOT, { recursive: true });
fs.rmdirSync(FIXTURES_ROOT, { recursive: true });
fs.mkdirSync(FIXTURES_ROOT, { recursive: true });

(async () => {
  const stream = fg.stream('**/*.scenario', { cwd: SCENARIOS_ROOT });

  for await (const entry of stream) {
    const scenarioPath = join(SCENARIOS_ROOT, entry as string);
    const source = await fs.promises.readFile(scenarioPath, 'utf8');
    const scenario = parseScenarioFile(source);
    const assets = scenario.assets === void 0 ? [] : await writeAssets(scenario.assets);

    const testFilename = `${basename(entry as string, true)}.test.ts`;
    const testDirname = dirname(entry as string);
    let testRoot = TESTS_ROOT;

    if (testDirname !== '.') {
      testRoot = join(TESTS_ROOT, testDirname);
      await fs.promises.mkdir(testRoot, { recursive: true });
    }

    const code = generate({
      assets,
      scenario,
      scenarioName: entry as string,
    });

    await fs.promises.writeFile(join(testRoot, testFilename), code);
  }
})();

async function writeAssets(assets: string[][]) {
  const list = [];
  const promises: Array<Promise<void>> = [];

  for (const [name, content] of assets) {
    const filename = uniqueSlug();
    list.push([name, filename]);
    promises.push(fs.promises.writeFile(join(FIXTURES_ROOT, filename), content));
  }

  await Promise.all(promises);
  return list;
}
