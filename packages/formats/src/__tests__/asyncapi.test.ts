import { aas2, aas2_0, aas2_1, aas2_2, aas2_3 } from '../asyncapi';

describe('AsyncAPI format', () => {
  describe('AsyncAPI 2.x', () => {
    it.each(['2.0.0', '2.1.0', '2.2.0', '2.3.0', '2.0.17', '2.1.37', '2.9.0', '2.9.3'])(
      'recognizes %s version correctly',
      version => {
        expect(aas2({ asyncapi: version }, null)).toBe(true);
      },
    );

    const testCases = [
      { asyncapi: '3.0' },
      { asyncapi: '3.0.0' },
      { asyncapi: '2' },
      { asyncapi: '2.0' },
      { asyncapi: '2.0.' },
      { asyncapi: '2.0.01' },
      { asyncapi: '1.0' },
      { asyncapi: 2 },
      { asyncapi: null },
      { openapi: '4.0' },
      { openapi: '2.0' },
      { openapi: null },
      { swagger: null },
      { swagger: '3.0' },
      {},
      null,
    ];

    it.each(testCases)('does not recognize invalid document %o', document => {
      expect(aas2(document, null)).toBe(false);
    });
  });

  describe('AsyncAPI 2.0', () => {
    it.each(['2.0.0', '2.0.3'])('recognizes %s version correctly', version => {
      expect(aas2_0({ asyncapi: version }, null)).toBe(true);
    });

    it.each(['2', '2.0', '2.1.0', '2.1.3'])('does not recognize %s version', version => {
      expect(aas2_0({ asyncapi: version }, null)).toBe(false);
    });
  });

  describe('AsyncAPI 2.1', () => {
    it.each(['2.1.0', '2.1.37'])('recognizes %s version correctly', version => {
      expect(aas2_1({ asyncapi: version }, null)).toBe(true);
    });

    it.each(['2', '2.1', '2.0.0', '2.2.0', '2.2.3'])('does not recognize %s version', version => {
      expect(aas2_1({ asyncapi: version }, null)).toBe(false);
    });
  });

  describe('AsyncAPI 2.2', () => {
    it.each(['2.2.0', '2.2.3'])('recognizes %s version correctly', version => {
      expect(aas2_2({ asyncapi: version }, null)).toBe(true);
    });

    it.each(['2', '2.2', '2.0.0', '2.1.0', '2.1.37', '2.3.0', '2.3.3'])('does not recognize %s version', version => {
      expect(aas2_2({ asyncapi: version }, null)).toBe(false);
    });
  });

  describe('AsyncAPI 2.3', () => {
    it.each(['2.3.0', '2.3.3'])('recognizes %s version correctly', version => {
      expect(aas2_3({ asyncapi: version }, null)).toBe(true);
    });

    it.each(['2', '2.3', '2.0.0', '2.1.0', '2.1.37', '2.2.0', '2.4.0', '2.4.3'])(
      'does not recognize %s version',
      version => {
        expect(aas2_3({ asyncapi: version }, null)).toBe(false);
      },
    );
  });
});
