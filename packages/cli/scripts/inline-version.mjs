import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const cwd = join(fileURLToPath(import.meta.url), '../..');

const { version } = JSON.parse(await fs.readFile(join(cwd, 'package.json'), 'utf8'));

await fs.writeFile(join(cwd, 'src/version.ts'), `export const VERSION = '${version}';\n`);
