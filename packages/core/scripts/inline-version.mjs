#!/usr/bin/env node
import recast from 'recast';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const target = path.join(__dirname, '..', 'dist', 'consts.js');

const source = fs.readFileSync(target, 'utf8');
const ast = recast.parse(source);

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
  } else if (
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'AssignmentExpression' &&
    node.expression.left.object.type === 'Identifier' &&
    node.expression.left.object.name === 'exports' &&
    node.expression.left.property.name === 'SPECTRAL_PKG_VERSION'
  ) {
    node.expression.right.value = pkg.version;
  }
}

fs.writeFileSync(target, recast.print(ast, { quote: 'single' }).code);
