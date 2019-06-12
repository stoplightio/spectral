import { RuleType, Spectral } from '../../../spectral';
import * as oas3Ruleset from '../ruleset.json';

declare var test: jest.It;

describe('valid-schema-example', () => {
  const s = new Spectral();

  s.addRules({
    'valid-schema-example': Object.assign(oas3Ruleset.rules['valid-schema-example'], {
      enabled: true,
      type: RuleType[oas3Ruleset.rules['valid-schema-example'].type],
    }),
  });

  describe('when example is not of schema.type', () => {
    test('reports example field validation issue', async () => {
      const results = await s.run({
        xoxo: {
          schema: {
            type: 'string',
          },
          example: 1234,
        },
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-schema-example',
          message: '"xoxo" property should be string',
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
          example: 'abc',
        },
      });

      expect(results).toHaveLength(0);
    });
  });
});
