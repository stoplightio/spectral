/**
 * This script generates a list of assets that are needed to load the built-in rulesets.
 * It contains all custom functions and *resolved* rulesets.
 * The assets are stored in a single file named `assets.json` in the following format:
 * `<require-call-path>: <content>`
 * where the `require-call-path` is the path you'd normally pass to require(), i.e. `@stoplight/spectral/rulesets/oas/index.js` and `content` is the text data.
 * Assets can be loaded using Spectral#registerStaticAssets static method, i.e. `Spectral.registerStaticAssets(require('@stoplight/spectral/rulesets/assets/assets.json'))`;
 * If you execute the code above, ruleset will be loaded fully offline, without a need to make any request.
 */

import { IUriParserResult } from '@stoplight/json-ref-resolver/types';
import * as path from '@stoplight/path';
import { parse } from '@stoplight/yaml';
import * as fs from 'fs';
import { promisify } from 'util';
import { httpAndFileResolver } from '../dist/resolvers/http-and-file';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

const baseDir = path.join(__dirname, '../rulesets/assets/');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

const assetsPath = path.join(baseDir, `assets.json`);
const generatedAssets = {};

(async () => {
  for (const kind of ['oas']) {
    await processDirectory(generatedAssets, path.join(__dirname, `../rulesets/${kind}`));
    await writeFileAsync(assetsPath, JSON.stringify(generatedAssets, null, 2));
  }
})();

async function processDirectory(assets: Record<string, string>, dir: string) {
  await Promise.all(
    (await readdirAsync(dir)).map(async (name: string) => {
      if (name === 'schemas') return;
      const target = path.join(dir, name);
      const stats = await statAsync(target);
      if (stats.isDirectory()) {
        return processDirectory(assets, target);
      } else {
        let content = await readFileAsync(target, 'utf8');
        if (path.extname(name) === '.json') {
          content = JSON.stringify(
            (
              await httpAndFileResolver.resolve(JSON.parse(content), {
                dereferenceRemote: true,
                dereferenceInline: false,
                baseUri: target,
                parseResolveResult(opts) {
                  return new Promise<IUriParserResult>((resolve, reject) => {
                    try {
                      resolve({ result: parse(opts.result) });
                    } catch (e) {
                      reject(e);
                    }
                  });
                },
              })
            ).result,
          );
        }

        assets[path.join('@stoplight/spectral', path.relative(path.join(__dirname, '..'), target))] = content;
      }
    }),
  );
}
