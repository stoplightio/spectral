import { isOpenApiv2, isOpenApiv3, isOpenApiv3_1 } from '../openapi';

describe('OpenAPI format', () => {
  describe('OpenAPI 2.0 aka Swagger', () => {
    it.each(['2.0.0', '2', '2.0'])('recognizes %s version correctly', version => {
      expect(isOpenApiv2({ swagger: version })).toBe(true);
    });

    it('does not recognize invalid document', () => {
      expect(isOpenApiv2({ openapi: '2.0' })).toBe(false);
      expect(isOpenApiv2({ openapi: null })).toBe(false);
      expect(isOpenApiv2({ swagger: null })).toBe(false);
      expect(isOpenApiv2({ swagger: '3.0' })).toBe(false);
      expect(isOpenApiv2({ swagger: '1.0' })).toBe(false);
      expect(isOpenApiv2({})).toBe(false);
      expect(isOpenApiv2(null)).toBe(false);
    });
  });

  describe('OpenAPI 3.x', () => {
    it.each(['3.0.0', '3', '3.0', '3.1.0', '3.0.3', '3.2'])('recognizes %s version correctly', version => {
      expect(isOpenApiv3({ openapi: version })).toBe(true);
    });

    it('does not recognize invalid document', () => {
      expect(isOpenApiv3({ openapi: '4.0' })).toBe(false);
      expect(isOpenApiv3({ openapi: '2.0' })).toBe(false);
      expect(isOpenApiv3({ openapi: null })).toBe(false);
      expect(isOpenApiv3({ swagger: null })).toBe(false);
      expect(isOpenApiv3({ swagger: '3.0' })).toBe(false);
      expect(isOpenApiv3({})).toBe(false);
      expect(isOpenApiv3(null)).toBe(false);
    });
  });

  describe('OpenAPI 3.0', () => {
    it.each(['3.0.0', '3.0', '3.0.3'])('recognizes %s version correctly', version => {
      expect(isOpenApiv3({ openapi: version })).toBe(true);
    });

    it.each(['3', '3.1', '3.1.0', '3.1.3'])('does not recognize %s version', version => {
      expect(isOpenApiv3({ openapi: version })).toBe(true);
    });
  });

  describe('OpenAPI 3.1', () => {
    it.each(['3.1.0', '3.1', '3.1.1'])('recognizes %s version correctly', version => {
      expect(isOpenApiv3_1({ openapi: version })).toBe(true);
    });

    it.each(['3', '3.0', '3.0.3', '3.0.0'])('does not recognize %s version', version => {
      expect(isOpenApiv3({ openapi: version })).toBe(true);
    });
  });
});
