import { DiagnosticSeverity } from '@stoplight/types';
import * as ruleset from '../index.json';
import { RuleType, Spectral } from '../../../spectral';

describe('duplicated-entry-in-enum', () => {
  const s = new Spectral();
  s.setRules({
    'duplicated-entry-in-enum': Object.assign(ruleset.rules['duplicated-entry-in-enum'], {
      recommended: true,
      type: RuleType[ruleset.rules['duplicated-entry-in-enum'].type],
    }),
  });

  describe('oas2', () => {
    test('does not report anything for empty object', async () => {
      const results = await s.run({
        swagger: '2.0',
      });

      expect(results).toEqual([]);
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

      expect(results).toEqual([]);
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

      expect(results).toEqual([
        {
          code: 'duplicated-entry-in-enum',
          message: `A duplicated entry in the enum was found. Error: \`enum\` property should not have duplicate items (items ## 1 and 5 are identical)`,
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

      expect(results).toEqual([]);
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

      expect(results).toEqual([]);
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

      expect(results).toEqual([
        {
          code: 'duplicated-entry-in-enum',
          message: `A duplicated entry in the enum was found. Error: \`enum\` property should not have duplicate items (items ## 1 and 5 are identical)`,
          path: ['components', 'schemas', 'Test', 'enum'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
        },
      ]);
    });
  });
});
