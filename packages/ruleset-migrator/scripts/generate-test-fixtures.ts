import * as path from 'path';
import * as fs from 'fs';
import * as prettier from 'prettier';

const cwd = path.join(__dirname, '../src/__tests__/__fixtures__');

fs.promises.readdir(cwd).then(async ls => {
  await fs.promises.mkdir(path.join(cwd, '.cache'), { recursive: true });
  const promises = [];
  const bundled = {};

  for (const dirname of ls) {
    if (dirname === '.cache') continue;
    const dirpath = path.join(cwd, dirname);
    const bundle = {};
    bundled[dirname] = bundle;
    promises.push(
      fs.promises.readFile(path.join(dirpath, 'output.cjs'), 'utf8').then(assign(bundle, 'output.cjs')),
      fs.promises.readFile(path.join(dirpath, 'output.mjs'), 'utf8').then(assign(bundle, 'output.mjs')),
      fs.promises.readFile(path.join(dirpath, 'ruleset.yaml'), 'utf8').then(assign(bundle, 'ruleset')),
      readdir(bundle, dirpath, 'assets').catch(() => {
        // it may not exist
      }),
    );
  }

  await Promise.all(promises);
  await fs.promises.writeFile(path.join(cwd, '.cache/index.json'), JSON.stringify(bundled, null, 2));
});

function assign(bundled: Record<string, string>, name: string) {
  return async (input: string): Promise<void> => {
    bundled[name] = /\.[mc]js$/.test(name) ? prettier.format(input as string, { parser: 'babel' }) : (input as string);
  };
}

async function readdir(output: Record<string, string>, cwd: string, relativePath: string): Promise<void> {
  const dirpath = path.join(cwd, relativePath);
  const list = await fs.promises.readdir(dirpath);
  await Promise.all(
    list.map(async item => {
      const filepath = path.join(cwd, relativePath, item);
      const stat = await fs.promises.stat(filepath);
      if (stat.isDirectory()) {
        await readdir(output, cwd, path.join(relativePath, item));
      } else {
        await assign(output, path.join(relativePath, item))(await fs.promises.readFile(filepath, 'utf8'));
      }
    }),
  );
}
