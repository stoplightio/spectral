#!/usr/bin/env node
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseDir = path.join(__dirname, '../__karma__/__fixtures__/');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

for (const rulesetName of ['oas', 'asyncapi']) {
  const target = path.join(baseDir, `${rulesetName}-functions.json`);
  const fnsPath = path.join(__dirname, `../rulesets/${rulesetName}/functions`);
  const bundledFns = {};

  if (fs.existsSync(fnsPath)) {
    const files = fs.readdirSync(fnsPath);

    for (const file of files) {
      bundledFns[file] = fs.readFileSync(path.join(fnsPath, file), 'utf-8');
    }
  }

  fs.writeFileSync(target, JSON.stringify(bundledFns, null, 2));
}
