import { join } from '@stoplight/path';
import * as fs from 'fs';
import { STATIC_ASSETS } from '../../assets';
import { readFile } from '../reader';

describe('readFile util', () => {
  describe('when a file descriptor is supplied', () => {
    let fileDescriptor: number;

    beforeEach(() => {
      fileDescriptor = fs.openSync(join(__dirname, '__fixtures__/simple'), 'r');
    });

    afterEach(() => {
      delete STATIC_ASSETS[fileDescriptor];
    });

    it('reads from file', async () => {
      expect(await readFile(fileDescriptor, { encoding: 'utf8' })).toEqual(`line 1
line 2
end
`);
    });

    it('always skips static assets', async () => {
      STATIC_ASSETS[fileDescriptor] = 'test';
      expect(await readFile(fileDescriptor, { encoding: 'utf8' })).not.toEqual('test');
    });

    it('throws when fd cannot be accessed', () => {
      return expect(readFile(2, { encoding: 'utf8' })).rejects.toThrow();
    });
  });
});
