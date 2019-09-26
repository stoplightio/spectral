#!/usr/bin/env node
const recast = require('recast');
const { builders: b } = require('ast-types');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const target = path.join(__dirname, '..', 'src', 'rulesets', 'finder.ts');

const source = fs.readFileSync(target, 'utf8');
const ast = recast.parse(source, {
  parser: require('recast/parsers/typescript'),
});

const {
  program: { body },
} = ast;

for (const node of body) {
  if (node.type === 'FunctionDeclaration' && node.id.name === 'resolveSpectralVersion') {
    node.body.body = [
      b.returnStatement(
        b.callExpression(
          b.memberExpression(
            b.callExpression(b.identifier('String'), [b.identifier(node.params[0].name)]),
            b.identifier('replace'),
          ),
          [
            b.stringLiteral(pkg.name),
            b.stringLiteral(`${pkg.name}@${pkg.version}`),
          ]
        )
      ),
    ];
  }
}

fs.writeFileSync(target, recast.print(ast, { quote: 'single' }).code);
