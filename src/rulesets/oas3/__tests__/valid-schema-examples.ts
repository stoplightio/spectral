import { RuleType, Spectral } from '../../../spectral';
import * as oas3Ruleset from '../ruleset.json';

declare var test: jest.It;

describe('valid-schema-examples', () => {
  const s = new Spectral();

  s.addRules({
    'valid-schema-examples': Object.assign(oas3Ruleset.rules['valid-schema-examples'], {
      enabled: true,
      type: RuleType[oas3Ruleset.rules['valid-schema-examples'].type],
    }),
  });

  describe('when example is not of schema.type', () => {
    test('reports example field validation issue', async () => {
      const results = await s.run({
        xoxo: {
          schema: {
            type: 'string',
          },
          examples: {
            a: {
              value: 123,
            },
          },
        },
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-schema-examples',
          message: '"a" property should be string',
        }),
      ]);
    });
  });

  describe('when example is of schema.type', () => {
    test('does not return validation issues', async () => {
      const results = await s.run({
        xoxo: {
          schema: {
            type: 'string',
          },
          examples: {
            a: {
              value: 'abc',
            },
          },
        },
      });

      expect(results).toHaveLength(0);
    });
  });
});
