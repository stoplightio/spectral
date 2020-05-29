/**
 * This script generates a list of assets that are needed to load the built-in rulesets.
 * It contains all custom functions and *resolved* rulesets.
 * The assets are stored in a single file named `assets.json` in the following format:
 * `<require-call-path>: <content>`
 * where the `require-call-path` is the path you'd normally pass to require(), i.e. `@stoplight/spectral/rulesets/oas/index.js` and `content` is the text data.
 * Assets can be loaded using Spectral#registerStaticAssets static method, i.e. `Spectral.registerStaticAssets(require('@stoplight/spectral/rulesets/assets/assets.json'))`;
 * If you execute the code above, ruleset will be loaded fully offline, without a need to make any request.
 */

import * as path from '@stoplight/path';
import * as fs from 'fs';
import { promisify } from 'util';
import * as $RefParser from '@apidevtools/json-schema-ref-parser';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

const baseDir = path.join(__dirname, '../rulesets/assets/');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

const generatedAssets = {};

(async () => {
  for (const kind of ['oas', 'asyncapi']) {
    const assets = await processDirectory(path.join(__dirname, `../rulesets/${kind}`));
    Object.assign(generatedAssets, assets);
    await writeFileAsync(path.join(baseDir, `assets.${kind}.json`), JSON.stringify(assets, null, 2));
  }

  await writeFileAsync(path.join(baseDir, `assets.json`), JSON.stringify(generatedAssets, null, 2));
})();

async function _processDirectory(assets: Record<string, string>, dir: string): Promise<void> {
  await Promise.all(
    (await readdirAsync(dir)).map(async (name: string) => {
      if (['schemas', '__tests__'].includes(name)) return;
      const target = path.join(dir, name);
      const stats = await statAsync(target);
      if (stats.isDirectory()) {
        return _processDirectory(assets, target);
      } else {
        let content = await readFileAsync(target, 'utf8');
        if (path.extname(name) === '.json') {
          content = JSON.stringify(await $RefParser.bundle(target, JSON.parse(content), {}))
        }

        assets[path.join('@stoplight/spectral', path.relative(path.join(__dirname, '..'), target))] = content;
      }
    }),
  );
}

async function processDirectory(dir: string): Promise<Record<string, string>> {
  const assets = {};
  await _processDirectory(assets, dir);
  return assets;
}
