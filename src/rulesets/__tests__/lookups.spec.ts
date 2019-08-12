import { isOpenApiv2_0, isOpenApiv3, isOpenApiv3_0, isOpenApiv3_1 } from '../lookups';

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var it: jest.It;

describe('Format lookups', () => {
  describe('OpenAPI 2.0 aka Swagger', () => {
    it.each(['2.0.0', '2', '2.0'])('recognizes %s version correctly', version => {
      expect(isOpenApiv2_0({ swagger: version })).toBe(true);
    });

    it('does not recognize invalid document', () => {
      expect(isOpenApiv2_0({ openapi: '2.0' })).toBe(false);
      expect(isOpenApiv2_0({ openapi: null })).toBe(false);
      expect(isOpenApiv2_0({ swagger: null })).toBe(false);
      expect(isOpenApiv2_0({ swagger: '3.0' })).toBe(false);
      expect(isOpenApiv2_0({ swagger: '1.0' })).toBe(false);
      expect(isOpenApiv2_0({})).toBe(false);
      expect(isOpenApiv2_0(null)).toBe(false);
    });
  });

  describe('OpenAPI 3.x', () => {
    it.each(['3.0.0', '3', '3.0', '3.1.0', '3.1'])('recognizes %s version correctly', version => {
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
    it.each(['3.0.0', '3', '3.0'])('recognizes %s version correctly', version => {
      expect(isOpenApiv3_0({ openapi: version })).toBe(true);
    });

    it('does not recognize invalid document', () => {
      expect(isOpenApiv3_0({ openapi: '4.0' })).toBe(false);
      expect(isOpenApiv3_0({ openapi: '2.0' })).toBe(false);
      expect(isOpenApiv3_0({ openapi: null })).toBe(false);
      expect(isOpenApiv3_0({ swagger: null })).toBe(false);
      expect(isOpenApiv3_0({ swagger: '3.0' })).toBe(false);
      expect(isOpenApiv3_0({})).toBe(false);
      expect(isOpenApiv3_0(null)).toBe(false);
    });
  });

  describe('OpenAPI 3.1', () => {
    it.each(['3.1.0', '3.1'])('recognizes %s version correctly', version => {
      expect(isOpenApiv3_1({ openapi: version })).toBe(true);
    });

    it('does not recognize invalid document', () => {
      expect(isOpenApiv3_1({ openapi: '4.0' })).toBe(false);
      expect(isOpenApiv3_1({ openapi: 3.0 })).toBe(false);
      expect(isOpenApiv3_1({ openapi: '2.0' })).toBe(false);
      expect(isOpenApiv3_1({ openapi: null })).toBe(false);
      expect(isOpenApiv3_1({ swagger: null })).toBe(false);
      expect(isOpenApiv3_1({ swagger: '3.0' })).toBe(false);
      expect(isOpenApiv3_1({})).toBe(false);
      expect(isOpenApiv3_1(null)).toBe(false);
    });
  });
});
