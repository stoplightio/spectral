#!/usr/bin/env node
/**
 * This script generates a list of assets that are needed to load spectral:oas ruleset.
 * It contains all OAS custom functions and *resolved* rulesets.
 * The assets are stores in a single filed call assets.json in the following format:
 * `<require-call-path>: <content>`
 * where the `require-call-path` is the path you'd normally pass to require(), i.e. `@stoplight/spectral/rulesets/oas/index.js` and `content` is the text data.
 * Assets can be loaded using Spectral#registerStaticAssets statc method, i.e. `Spectral.registerStaticAssets(require('@stoplight/spectral/rulesets/assets/assets.json'))`;
 * If you execute the code above, ruleset will be loaded fully offline, without a need to make any request.
 */

const path = require('@stoplight/path');
const fs = require('fs');
const { promisify } = require('util');
const { parse } = require('@stoplight/yaml');
const { httpAndFileResolver } = require('../dist/resolvers/http-and-file');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

const baseDir = path.join(__dirname, '../rulesets/assets/');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

const target = path.join(baseDir, `assets.json`);
const assets = {};

(async () => {
  await processDirectory(assets, path.join(__dirname, '../rulesets/oas'));
  await writeFileAsync(target, JSON.stringify(assets, null, 2));
})();

async function processDirectory(assets, dir) {
  await Promise.all((await readdirAsync(dir)).map(async name => {
    if (name === 'schemas') return;
    const target = path.join(dir, name);
    const stats = await statAsync(target);
    if (stats.isDirectory()) {
      return processDirectory(assets, target);
    } else {
      let content = await readFileAsync(target, 'utf8');
      if (path.extname(name) === '.json') {
        content = JSON.stringify((await httpAndFileResolver.resolve(JSON.parse(content), {
          dereferenceRemote: true,
          dereferenceInline: false,
          baseUri: target,
          parseResolveResult(opts) {
            opts.result = parse(opts.result);
            return opts;
          },
        })).result);
      }

      assets[path.join('@stoplight/spectral', path.relative(path.join(__dirname, '..'), target))] = content;
    }
  }));
}
