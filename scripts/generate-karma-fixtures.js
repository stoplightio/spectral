#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const target = path.join(__dirname, '../src/__tests__/__fixtures__/oas-functions.json');

const fnsPath = path.join(__dirname, '../rulesets/oas/functions')

const files = fs.readdirSync(fnsPath);

const bundledFns = {};

for (const file of files) {
  bundledFns[file] = fs.readFileSync(path.join(fnsPath, file), 'utf-8')
}

fs.writeFileSync(target, JSON.stringify(bundledFns, null, 2))
