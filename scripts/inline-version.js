#!/usr/bin/env node
const recast = require('recast');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const target = path.join(__dirname, '..', 'src', 'consts.ts');

const source = fs.readFileSync(target, 'utf8');
const ast = recast.parse(source, {
  parser: require('recast/parsers/typescript'),
});

const {
  program: { body },
} = ast;

for (const node of body) {
  if (
    node.type === 'ExportNamedDeclaration' &&
    node.declaration !== null &&
    node.declaration.declarations.length > 0 &&
    node.declaration.declarations[0].id.name === 'SPECTRAL_PKG_VERSION'
  ) {
    node.declaration.declarations[0].init.value = pkg.version;
  }
}

fs.writeFileSync(target, recast.print(ast, { quote: 'single' }).code);
