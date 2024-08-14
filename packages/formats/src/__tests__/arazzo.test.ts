import { arazzo1_0 } from '../arazzo';

describe('Arazzo format', () => {
  describe('Arazzo 1.0.x', () => {
    it.each(['1.0.0', '1.0', '1.0.1', '1.0.2', '1.0.99'])('recognizes %s version correctly', version => {
      expect(arazzo1_0({ arazzo: version }, null)).toBe(true);
    });

    const testCases = [
      { arazzo: '0.1' },
      { arazzo: '1.1.0' },
      { arazzo: '2' },
      { arazzo: '2.0' },
      { arazzo: '2.0.' },
      { arazzo: '2.0.01' },
      { arazzo: 2 },
      { arazzo: null },
      { arazzo: '4.0' },
      {},
      null,
    ];

    it.each(testCases)('does not recognize invalid document %o', document => {
      expect(arazzo1_0(document, null)).toBe(false);
    });
  });
});
