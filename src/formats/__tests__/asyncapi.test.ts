import { isAsyncApiv2 } from '../asyncapi';

describe('AsyncApi format', () => {
  describe('AsyncApi 2.{minor}.{patch}', () => {
    it.each([['2.0.17'], ['2.9.0'], ['2.9.3']])('recognizes %s version correctly', (version: string) => {
      expect(isAsyncApiv2({ asyncapi: version })).toBe(true);
    });

    const testCases = [
      { asyncapi: '3.0' },
      { asyncapi: '3.0.0' },
      { asyncapi: '2' },
      { asyncapi: '2.0' },
      { asyncapi: '2.0.' },
      { asyncapi: '2.0.01' },
      { asyncapi: '1.0' },
      { asyncapi: 2 },
      { openapi: '4.0' },
      { openapi: '2.0' },
      { openapi: null },
      { swagger: null },
      { swagger: '3.0' },
      {},
      null,
    ];

    it.each(testCases)('does not recognize invalid document %o', document => {
      expect(isAsyncApiv2(document)).toBe(false);
    });
  });
});
