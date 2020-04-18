#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

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
