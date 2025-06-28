#!/usr/bin/env node
import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as astring from 'astring';
import { builders as b } from 'ast-types';

import eol from 'eol';
import { glob } from 'tinyglobby';

const cwd = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

glob('src/html/*.html', { cwd, absolute: true, expandDirectories: false })
  .then(files =>
    Promise.all(
      files.map(async file => ({ file: path.basename(file), content: eol.lf(await fs.readFile(file, 'utf8')) })),
    ),
  )
  .then(async items => {
    const root = b.exportDefaultDeclaration(
      b.objectExpression(items.map(({ file, content }) => b.property('init', b.literal(file), b.literal(content)))),
    );

    await fs.writeFile(path.join(cwd, 'src/html/templates.ts'), astring.generate(root));
  });
