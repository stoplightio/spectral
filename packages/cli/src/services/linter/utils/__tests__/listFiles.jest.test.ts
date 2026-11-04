import { join, normalize } from '@stoplight/path';
import * as fs from 'fs';
import * as os from 'os';
import { listFiles } from '../listFiles';

describe('listFiles CLI util with real files', () => {
  let cwd: string;
  let dir: string;

  beforeEach(() => {
    cwd = process.cwd();
    dir = fs.realpathSync(fs.mkdtempSync(join(os.tmpdir(), 'spectral-list-files-')));
    for (const name of ['spec(1).json', 'spec[v2].yaml', 'spec{a,b}.json', 'plain.json']) {
      fs.writeFileSync(join(dir, name), '{}');
    }

    process.chdir(dir);
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it.each(['spec(1).json', 'spec[v2].yaml', 'spec{a,b}.json'])(
    'finds an existing file whose name looks like a glob: %s',
    async name => {
      const expected = [[normalize(join(dir, name))], []];

      expect(await listFiles([name], false)).toEqual(expected);
      expect(await listFiles([name], true)).toEqual(expected);
      expect(await listFiles([join(dir, name)], false)).toEqual(expected);
    },
  );

  it('still expands glob patterns', async () => {
    expect(await listFiles(['*.json'], false)).toEqual([
      [
        normalize(join(dir, 'plain.json')),
        normalize(join(dir, 'spec(1).json')),
        normalize(join(dir, 'spec{a,b}.json')),
      ],
      [],
    ]);
  });

  it('mixes files and globs and lists each file once', async () => {
    expect(await listFiles(['spec(1).json', 'plain.json', 'plain.*'], true)).toEqual([
      [normalize(join(dir, 'plain.json')), normalize(join(dir, 'spec(1).json'))],
      [],
    ]);
  });

  it('reports a missing file as an unmatched pattern', async () => {
    expect(await listFiles(['missing(1).json'], false)).toEqual([[], ['missing(1).json']]);
  });
});
