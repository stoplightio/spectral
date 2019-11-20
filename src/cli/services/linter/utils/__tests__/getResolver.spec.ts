import { join, relative } from '@stoplight/path';
import { httpAndFileResolver } from '../../../../../resolvers/http-and-file';
import { getResolver } from '../getResolver';

const customResolver = require('./__fixtures__/resolver');

describe('getResolver', () => {
  it('resolves absolute path to the file', () => {
    expect(getResolver(join(__dirname, './__fixtures__/resolver.js'))).toStrictEqual(customResolver);
  });

  it('resolves relative path to the file', () => {
    const relativePath = relative(process.cwd(), join(__dirname, './__fixtures__/resolver.js'));
    expect(getResolver(relativePath)).toStrictEqual(customResolver);
  });

  it('throws when module cannot be imported', () => {
    expect(getResolver.bind(null, join(__dirname, 'test.json'))).toThrow(
      `Cannot find module '${__dirname}/test.json' from 'getResolver.ts'`,
    );
  });

  it('given no path, returns default resolver', () => {
    expect(getResolver(void 0)).toBe(httpAndFileResolver);
  });
});
