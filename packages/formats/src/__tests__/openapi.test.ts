import { oas2, oas3, oas3_0, oas3_1 } from '../openapi';

describe('OpenAPI format', () => {
  describe('OpenAPI 2.0 aka Swagger', () => {
    it.each(['2.0.0', '2', '2.0'])('recognizes %s version correctly', version => {
      expect(oas2({ swagger: version }, null)).toBe(true);
    });

    it('does not recognize invalid document', () => {
      expect(oas2({ openapi: '2.0' }, null)).toBe(false);
      expect(oas2({ openapi: null }, null)).toBe(false);
      expect(oas2({ swagger: null }, null)).toBe(false);
      expect(oas2({ swagger: '3.0' }, null)).toBe(false);
      expect(oas2({ swagger: '1.0' }, null)).toBe(false);
      expect(oas2({}, null)).toBe(false);
      expect(oas2(null, null)).toBe(false);
    });
  });

  describe('OpenAPI 3.x', () => {
    it.each(['3.0.0', '3', '3.0', '3.1.0', '3.0.3', '3.2'])('recognizes %s version correctly', version => {
      expect(oas3({ openapi: version }, null)).toBe(true);
    });

    it('does not recognize invalid document', () => {
      expect(oas3({ openapi: '4.0' }, null)).toBe(false);
      expect(oas3({ openapi: '2.0' }, null)).toBe(false);
      expect(oas3({ openapi: null }, null)).toBe(false);
      expect(oas3({ swagger: null }, null)).toBe(false);
      expect(oas3({ swagger: '3.0' }, null)).toBe(false);
      expect(oas3({}, null)).toBe(false);
      expect(oas3(null, null)).toBe(false);
    });
  });

  describe('OpenAPI 3.0', () => {
    it.each(['3.0.0', '3.0', '3.0.3'])('recognizes %s version correctly', version => {
      expect(oas3_0({ openapi: version }, null)).toBe(true);
    });

    it.each(['3', '3.1', '3.1.0', '3.1.3'])('does not recognize %s version', version => {
      expect(oas3_0({ openapi: version }, null)).toBe(false);
    });
  });

  describe('OpenAPI 3.1', () => {
    it.each(['3.1.0', '3.1', '3.1.1'])('recognizes %s version correctly', version => {
      expect(oas3_1({ openapi: version }, null)).toBe(true);
    });

    it.each(['3', '3.0', '3.0.3', '3.0.0'])('does not recognize %s version', version => {
      expect(oas3_1({ openapi: version }, null)).toBe(false);
    });
  });
});
