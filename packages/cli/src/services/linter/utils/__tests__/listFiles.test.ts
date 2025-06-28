import * as path from '@stoplight/path';
import { glob } from 'tinyglobby';
import { listFiles } from '../listFiles';

jest.mock('tinyglobby', () => ({
  glob: jest.fn(async () => []),
}));

describe('listFiles CLI util', () => {
  it('unixify paths', () => {
    listFiles(['.\\repro\\lib.yaml', './foo/*.json', '.\\src\\__tests__\\__fixtures__\\*.oas.json'], true);
    expect(glob).toBeCalledWith(['./repro/lib.yaml', './foo/*.json', './src/__tests__/__fixtures__/*.oas.json'], {
      dot: true,
      absolute: true,
    });
  });

  it('returns file paths', async () => {
    const list = [path.join(__dirname, 'foo/a.json'), path.join(__dirname, 'foo/b.json')];

    (glob as unknown as jest.Mock).mockResolvedValueOnce([...list]);

    expect(await listFiles(['./foo/*.json'], true)).toEqual([list, []]);
  });

  it('given disabled ignoredUnmatchedGlobs, reports unmatched patterns', async () => {
    const list = [path.join(__dirname, 'foo/a.json'), path.join(__dirname, 'foo/b.json')];

    (glob as unknown as jest.Mock).mockImplementation(async pattern => {
      if (pattern === './foo/*.json') {
        return list;
      }

      return [];
    });

    expect(await listFiles(['./foo/*.json', 'bar/**/baz*.yaml'], false)).toEqual([list, ['bar/**/baz*.yaml']]);
  });
});
