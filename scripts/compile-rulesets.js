#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { readRuleset } = require('../dist/rulesets');

const dist = path.join(__dirname, '../rulesets/precompiled/')

const rulesetNames = ['oas2', 'oas3', 'oas'];

try {
  fs.mkdirSync(dist);
} catch (ex) {

}

Promise.all(
  rulesetNames.map(ruleset => readRuleset(`spectral:${ruleset}`)),
).then(rulesets => {
  for (const [i, ruleset] of rulesets.entries()) {
    fs.writeFileSync(
      path.join(dist, `${rulesetNames[i]}.json`),
      JSON.stringify(ruleset),
    );
  }
});

