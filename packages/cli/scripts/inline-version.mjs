import * as fs from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const cwd = join(fileURLToPath(import.meta.url), '../..');

const version =
  process.argv.length === 3 ? process.argv[2] : JSON.parse(fs.readFileSync(join(cwd, 'package.json'), 'utf8')).version;

fs.writeFileSync(join(cwd, 'src/version.ts'), `export const VERSION = '${version}';\n`);
