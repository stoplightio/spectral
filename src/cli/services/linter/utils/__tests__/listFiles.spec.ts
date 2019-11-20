import * as path from 'path';
import * as fg from 'fast-glob';
import { listFiles } from '../listFiles';

jest.mock('fast-glob', () => jest.fn(async () => []));

describe('listFiles CLI util', () => {
  it('unixify paths', () => {
    listFiles(['.\\repro\\lib.yaml', './foo/*.json', '.\\src\\__tests__\\__fixtures__\\*.oas.json']);
    expect(fg).toBeCalledWith(['./repro/lib.yaml', './foo/*.json', './src/__tests__/__fixtures__/*.oas.json'], {
      dot: true,
      absolute: true,
    });
  });

  it('returns file paths', async () => {
    const list = [path.join(__dirname, 'foo/a.json'), path.join(__dirname, 'foo/b.json')];

    ((fg as unknown) as jest.Mock).mockResolvedValueOnce([...list]);

    expect(await listFiles(['./foo/*.json'])).toEqual(list);
  });
});
