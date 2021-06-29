#!/usr/bin/env node
import recast from 'recast';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import ts from 'recast/parsers/typescript.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const target = path.join(__dirname, '..', 'src', 'consts.ts');

const source = fs.readFileSync(target, 'utf8');
const ast = recast.parse(source, {
  parser: ts,
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
