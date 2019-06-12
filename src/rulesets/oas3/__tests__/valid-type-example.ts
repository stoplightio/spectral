import { RuleType, Spectral } from '../../../spectral';
import * as oas3Ruleset from '../ruleset.json';

declare var test: jest.It;

describe('valid-type-example', () => {
  const s = new Spectral();

  s.addRules({
    'valid-type-example': Object.assign(oas3Ruleset.rules['valid-type-example'], {
      enabled: true,
      type: RuleType[oas3Ruleset.rules['valid-type-example'].type],
    }),
  });

  describe('when simple example is invalid', () => {
    it('fails', async () => {
      const results = await s.run({
        xoxo: {
          type: 'string',
          example: 123,
        },
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-type-example',
          message: `\"xoxo\" property should be string`,
        }),
      ]);
    });
  });

  describe('when example is inside schema', () => {
    describe('when schema is not inside an array', () => {
      it('does not care about example in schema', async () => {
        const results = await s.run({
          schema: {
            type: 'string',
            example: 123,
          },
        });

        expect(results).toHaveLength(0);
      });
    });

    describe('when schema is inside an array', () => {
      it('should not care about example in schema - arr', async () => {
        const results = await s.run({
          ok: [
            {
              schema: {
                type: 'string',
                example: 123,
              },
            },
          ],
        });

        expect(results).toHaveLength(0);
      });
    });
  });

  describe('arrays', () => {
    describe('array of objects', () => {
      it('fails', async () => {
        const results = await s.run({
          xoxo: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                },
              },
            },
            example: 'wrong example',
          },
        });

        expect(results).toEqual([
          expect.objectContaining({
            code: 'valid-type-example',
            message: `\"xoxo\" property should be array`,
          }),
        ]);

        expect(results).toHaveLength(1);
      });
    });

    describe('array of primitives', () => {
      it('fails', async () => {
        const results = await s.run({
          xoxo: {
            type: 'array',
            items: {
              type: 'integer',
            },
            example: 4444,
          },
        });

        expect(results).toEqual([
          expect.objectContaining({
            code: 'valid-type-example',
            message: `\"xoxo\" property should be array`,
          }),
        ]);

        expect(results).toHaveLength(1);
      });
    });
  });

  describe('objects', () => {
    it('errors with totally invalid input', async () => {
      const results = await s.run({
        xoxo: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
            },
            width: {
              type: 'integer',
            },
            height: {
              type: 'integer',
            },
          },
          required: ['url'],
          example: {
            url2: 'images/38.png',
            width: 'coffee',
            height: false,
          },
        },
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-type-example',
          message: `\"xoxo\" property should have required property 'url'`,
        }),
        expect.objectContaining({
          code: 'valid-type-example',
          message: `\"xoxo\" property .width should be integer`,
        }),
        expect.objectContaining({
          code: 'valid-type-example',
          message: `\"xoxo\" property .height should be integer`,
        }),
      ]);

      expect(results).toHaveLength(3);
    });

    test.each([['byte', '1'], ['int32', 2 ** 31], ['int64', 2 ** 63], ['float', 2 ** 128]])(
      'reports invalid usage of %s format',
      async (format, example) => {
        const results = await s.run({
          xoxo: {
            type: 'object',
            properties: {
              ip_address: {
                type: ['string', 'number'],
                format,
                example,
              },
            },
          },
        });

        expect(results).toEqual([
          expect.objectContaining({
            code: 'valid-type-example',
            message: `"ip_address" property should match format "${format}"`,
          }),
        ]);
      },
    );
  });
});
