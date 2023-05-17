#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import process from 'node:process';

import eol from 'eol';
import * as recast from 'recast';

await Promise.all(
  process.argv.slice(2).map(async input => {
    const target = path.join(process.cwd(), input);
    const source = await fs.readFile(target, 'utf8');
    const ast = recast.parse(source);

    for (const node of ast.program.body) {
      if (node.type !== 'VariableDeclaration') continue;

      for (const declaration of node.declarations) {
        if (!declaration.id.name.endsWith('Template')) continue;
        if (declaration.init.type !== 'CallExpression' || declaration.init.arguments.length !== 1) continue;
        const arg = declaration.init.arguments[0];
        if (arg.type === 'Literal' && arg.value.endsWith('.html')) {
          arg.value = eol.lf(
            await fs.readFile(path.join(process.cwd(), input.replace('dist', 'src'), '..', arg.value), 'utf8'),
          );
        }
      }
    }

    await fs.writeFile(target, recast.print(ast, { quote: 'single' }).code);
  }),
);
