import {
  jsonSchema,
  jsonSchemaLoose,
  jsonSchemaDraft4,
  jsonSchemaDraft6,
  jsonSchemaDraft7,
  jsonSchemaDraft2020_12,
  jsonSchemaDraft2019_09,
} from '../jsonSchema';
import type { Format } from '@stoplight/spectral-core';

describe('JSON Schema format', () => {
  describe('JSON Schema strict', () => {
    it.each([
      'http://json-schema.org/schema#',
      'https://json-schema.org/schema#',
      'http://json-schema.org/hyper-schema#',
      'http://json-schema.org/draft-04/schema#',
      'http://json-schema.org/draft-04/hyper-schema#',
      'http://json-schema.org/draft-06/schema#',
      'http://json-schema.org/draft-06/hyper-schema#',
    ])('recognizes %s schema correctly', $schema => {
      expect(jsonSchema({ $schema }, null)).toBe(true);
    });

    it('does not recognize invalid document', () => {
      expect(jsonSchema({ $schema: '2.0' }, null)).toBe(false);
      expect(jsonSchema({ $schema: 'json-schema' }, null)).toBe(false);
      expect(jsonSchema({ $schema: 2 }, null)).toBe(false);
      expect(jsonSchema({ swagger: null }, null)).toBe(false);
      expect(jsonSchema({ allOf: [] }, null)).toBe(false);
      expect(jsonSchema({ type: 'string' }, null)).toBe(false);
      expect(jsonSchema({}, null)).toBe(false);
      expect(jsonSchema(null, null)).toBe(false);
    });
  });

  describe('JSON Schema loose', () => {
    describe('by $schema', () => {
      it.each([
        'http://json-schema.org/schema#',
        'https://json-schema.org/schema#',
        'http://json-schema.org/hyper-schema#',
        'http://json-schema.org/draft-04/schema#',
        'http://json-schema.org/draft-04/hyper-schema#',
        'http://json-schema.org/draft-06/schema#',
        'http://json-schema.org/draft-06/hyper-schema#',
      ])('recognizes %s schema correctly', $schema => {
        expect(jsonSchemaLoose({ $schema }, null)).toBe(true);
      });
    });

    describe('by type', () => {
      it.each(['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'])(
        'recognizes %s type correctly',
        type => {
          expect(jsonSchemaLoose({ type }, null)).toBe(true);
        },
      );

      it.each(['foo', 'bar', 1, 2, void 0, null])('does not recognize invalid %s type', type => {
        expect(jsonSchemaLoose({ type }, null)).toBe(false);
      });
    });

    describe('by combiner', () => {
      it.each(['allOf', 'oneOf', 'anyOf'])('recognizes %s combiner correctly', combiner => {
        expect(jsonSchemaLoose({ [combiner]: [] }, null)).toBe(true);
      });

      it.each(['allOf', 'oneOf', 'anyOf'])('does not %s combiner that is not an object', combiner => {
        expect(jsonSchemaLoose({ [combiner]: void 0 }, null)).toBe(false);
        expect(jsonSchemaLoose({ [combiner]: 0 }, null)).toBe(false);
        expect(jsonSchemaLoose({ [combiner]: '' }, null)).toBe(false);
        expect(jsonSchemaLoose({ [combiner]: null }, null)).toBe(false);
      });
    });

    it('recognizes by the presence of "not"', () => {
      expect(jsonSchemaLoose({ not: {} }, null)).toBe(true);
    });

    describe('mixed', () => {
      it('invalid type but valid combiner', () => {
        expect(jsonSchemaLoose({ type: 'foo', allOf: [] }, null)).toBe(true);
      });

      it('valid type but invalid combiner', () => {
        expect(jsonSchemaLoose({ type: 'string', allOf: null }, null)).toBe(true);
      });
    });
  });

  describe('JSON Schema Draft 4', () => {
    it.each([
      'http://json-schema.org/draft-04/schema#',
      'https://json-schema.org/draft-04/schema#',
      'http://json-schema.org/draft-04/schema',
      'https://json-schema.org/draft-04/schema',
      'http://json-schema.org/draft-04/hyper-schema#',
      'https://json-schema.org/draft-04/hyper-schema#',
      'http://json-schema.org/draft-04/hyper-schema',
      'https://json-schema.org/draft-04/hyper-schema',
    ])('recognizes %s schema correctly', $schema => {
      expect(jsonSchemaDraft4({ $schema }, null)).toBe(true);
    });

    it.each([
      'http://json-schema.org/schema#',
      'https://json-schema.org/schema#',
      'http://json-schema.org/hyper-schema#',
      'http://json-schema.org/draft-06/schema#',
      'http://json-schema.org/draft-06/hyper-schema#',
    ])('does not recognize %s schema', $schema => {
      expect(jsonSchemaDraft4({ $schema }, null)).toBe(false);
    });

    it('does not recognize invalid document', () => {
      expect(jsonSchemaDraft4({ $schema: '2.0' }, null)).toBe(false);
      expect(jsonSchemaDraft4({ $schema: 'json-schema' }, null)).toBe(false);
      expect(jsonSchemaDraft4({ $schema: 2 }, null)).toBe(false);
      expect(jsonSchemaDraft4({ swagger: null }, null)).toBe(false);
      expect(jsonSchemaDraft4({ allOf: [] }, null)).toBe(false);
      expect(jsonSchemaDraft4({ type: 'string' }, null)).toBe(false);
      expect(jsonSchemaDraft4({}, null)).toBe(false);
      expect(jsonSchemaDraft4(null, null)).toBe(false);
    });
  });
  describe('JSON Schema Draft 6', () => {
    it.each([
      'http://json-schema.org/draft-06/schema#',
      'https://json-schema.org/draft-06/schema#',
      'http://json-schema.org/draft-06/schema',
      'https://json-schema.org/draft-06/schema',
      'http://json-schema.org/draft-06/hyper-schema#',
      'https://json-schema.org/draft-06/hyper-schema#',
      'http://json-schema.org/draft-06/hyper-schema',
      'https://json-schema.org/draft-06/hyper-schema',
    ])('recognizes %s schema correctly', $schema => {
      expect(jsonSchemaDraft6({ $schema }, null)).toBe(true);
    });

    it.each([
      'http://json-schema.org/schema#',
      'https://json-schema.org/schema#',
      'http://json-schema.org/hyper-schema#',
      'http://json-schema.org/draft-04/schema#',
      'http://json-schema.org/draft-04/hyper-schema#',
    ])('does not recognize %s schema', $schema => {
      expect(jsonSchemaDraft6({ $schema }, null)).toBe(false);
    });

    it('does not recognize invalid document', () => {
      expect(jsonSchemaDraft6({ $schema: '2.0' }, null)).toBe(false);
      expect(jsonSchemaDraft6({ $schema: 'json-schema' }, null)).toBe(false);
      expect(jsonSchemaDraft6({ $schema: 2 }, null)).toBe(false);
      expect(jsonSchemaDraft6({ swagger: null }, null)).toBe(false);
      expect(jsonSchemaDraft6({ allOf: [] }, null)).toBe(false);
      expect(jsonSchemaDraft6({ type: 'string' }, null)).toBe(false);
      expect(jsonSchemaDraft6({}, null)).toBe(false);
      expect(jsonSchemaDraft6(null, null)).toBe(false);
    });
  });

  describe('JSON Schema Draft 7', () => {
    it.each([
      'http://json-schema.org/draft-07/schema#',
      'https://json-schema.org/draft-07/schema#',
      'http://json-schema.org/draft-07/schema',
      'https://json-schema.org/draft-07/schema',
      'http://json-schema.org/draft-07/hyper-schema#',
      'https://json-schema.org/draft-07/hyper-schema#',
      'http://json-schema.org/draft-07/hyper-schema',
      'https://json-schema.org/draft-07/hyper-schema',
    ])('recognizes %s schema correctly', $schema => {
      expect(jsonSchemaDraft7({ $schema }, null)).toBe(true);
    });

    it.each([
      'http://json-schema.org/schema#',
      'https://json-schema.org/schema#',
      'http://json-schema.org/hyper-schema#',
      'http://json-schema.org/draft-06/schema#',
      'http://json-schema.org/draft-06/hyper-schema#',
    ])('does not recognize %s schema', $schema => {
      expect(jsonSchemaDraft7({ $schema }, null)).toBe(false);
    });

    it('does not recognize invalid document', () => {
      expect(jsonSchemaDraft7({ $schema: '2.0' }, null)).toBe(false);
      expect(jsonSchemaDraft7({ $schema: 'json-schema' }, null)).toBe(false);
      expect(jsonSchemaDraft7({ $schema: 2 }, null)).toBe(false);
      expect(jsonSchemaDraft7({ swagger: null }, null)).toBe(false);
      expect(jsonSchemaDraft7({ allOf: [] }, null)).toBe(false);
      expect(jsonSchemaDraft7({ type: 'string' }, null)).toBe(false);
      expect(jsonSchemaDraft7({}, null)).toBe(false);
      expect(jsonSchemaDraft7(null, null)).toBe(false);
    });
  });

  describe.each<[string, Format]>([
    ['2019-09', jsonSchemaDraft2019_09],
    ['2020-12', jsonSchemaDraft2020_12],
  ])('JSON Schema Draft %s', (draft, fn) => {
    it.each([
      `http://json-schema.org/draft/${draft}/schema#`,
      `https://json-schema.org/draft/${draft}/schema#`,
      `http://json-schema.org/draft/${draft}/schema`,
      `https://json-schema.org/draft/${draft}/schema`,
      `http://json-schema.org/draft/${draft}/hyper-schema#`,
      `https://json-schema.org/draft/${draft}/hyper-schema#`,
      `http://json-schema.org/draft/${draft}/hyper-schema`,
      `https://json-schema.org/draft/${draft}/hyper-schema`,
    ])('recognizes %s schema correctly', $schema => {
      expect(fn({ $schema }, null)).toBe(true);
    });

    it.each([
      'http://json-schema.org/schema#',
      'https://json-schema.org/schema#',
      'http://json-schema.org/hyper-schema#',
      'http://json-schema.org/draft-06/schema#',
      'http://json-schema.org/draft-06/hyper-schema#',
    ])('does not recognize %s schema', $schema => {
      expect(fn({ $schema }, null)).toBe(false);
    });

    it('does not recognize invalid document', () => {
      expect(fn({ $schema: '2.0' }, null)).toBe(false);
      expect(fn({ $schema: 'json-schema' }, null)).toBe(false);
      expect(fn({ $schema: 2 }, null)).toBe(false);
      expect(fn({ swagger: null }, null)).toBe(false);
      expect(fn({ allOf: [] }, null)).toBe(false);
      expect(fn({ type: 'string' }, null)).toBe(false);
      expect(fn({}, null)).toBe(false);
      expect(fn(null, null)).toBe(false);
    });
  });
});
