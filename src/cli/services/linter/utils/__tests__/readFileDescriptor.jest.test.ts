import { join } from '@stoplight/path';
import * as fs from 'fs';
import { readFileDescriptor } from '../readFileDescriptor';

describe('readFileDescriptor', () => {
  describe('when a file descriptor is supplied', () => {
    it('reads from file', async () => {
      const fileDescriptor = fs.openSync(join(__dirname, '__fixtures__/simple'), 'r');

      const contents = await readFileDescriptor(fileDescriptor, { encoding: 'utf8' });
      // normalize line endings
      expect(contents.replace(/\r\n/g, '\n')).toEqual(`line 1
line 2
end
`);
    });

    it('throws when fd cannot be accessed', () => {
      return expect(readFileDescriptor(2147483647, { encoding: 'utf8' })).rejects.toThrow();
    });
  });
});
