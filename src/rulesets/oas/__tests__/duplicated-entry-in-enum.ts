import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../index';
import { createWithRules } from './__helpers__/createWithRules';

describe('duplicated-entry-in-enum', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['duplicated-entry-in-enum']);
  });
  describe('oas2', () => {
    test('does not report anything for empty object', async () => {
      const results = await s.run({
        swagger: '2.0',
      });

      expect([...results]).toEqual([]);
    });

    test('does not report anything when the model valid', async () => {
      const doc = {
        swagger: '2.0',
        definitions: {
          Test: {
            type: 'integer',
            enum: [1, 2, 3],
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([]);
    });

    test('does not report anything when enum is an object property', async () => {
      const doc = {
        openapi: '3.0.2',
        components: {
          schemas: {
            schema: {
              type: 'object',
              properties: {
                enum: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([]);
    });

    test('identifies enum with duplicated entries', async () => {
      const doc = {
        swagger: '2.0',
        definitions: {
          Test: {
            type: 'integer',
            enum: [1, 2, 3, 4, 5, 2],
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([
        {
          code: 'duplicated-entry-in-enum',
          message: `A duplicated entry in the enum was found. Error: \`enum\` property must not have duplicate items (items ## 1 and 5 are identical)`,
          path: ['definitions', 'Test', 'enum'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
        },
      ]);
    });
  });

  describe('oas3', () => {
    test('does not report anything for empty object', async () => {
      const results = await s.run({
        openapi: '3.0.0',
      });

      expect([...results]).toEqual([]);
    });

    test('does not report anything when the model is valid', async () => {
      const doc = {
        openapi: '3.0.0',
        components: {
          schemas: {
            Test: {
              type: 'integer',
              enum: [1, 2, 3],
            },
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([]);
    });

    test('identifies enum with duplicated entries', async () => {
      const doc = {
        openapi: '3.0.0',
        components: {
          schemas: {
            Test: {
              type: 'integer',
              enum: [1, 2, 3, 4, 5, 2],
            },
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([
        {
          code: 'duplicated-entry-in-enum',
          message: `A duplicated entry in the enum was found. Error: \`enum\` property must not have duplicate items (items ## 1 and 5 are identical)`,
          path: ['components', 'schemas', 'Test', 'enum'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
        },
      ]);
    });
  });
});
