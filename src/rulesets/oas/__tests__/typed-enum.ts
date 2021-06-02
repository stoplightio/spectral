import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../index';
import { createWithRules } from './__helpers__/createWithRules';

describe('typed-enum', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['typed-enum']);
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

    test('identifies enum values which do not respect the type', async () => {
      const doc = {
        swagger: '2.0',
        definitions: {
          Test: {
            type: 'integer',
            enum: [1, 'a string!', 3, 'and another one!'],
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([
        {
          code: 'typed-enum',
          message: 'Enum value `a string!` does not respect the specified type `integer`.',
          path: ['definitions', 'Test', 'enum', '1'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
        },
        {
          code: 'typed-enum',
          message: 'Enum value `and another one!` does not respect the specified type `integer`.',
          path: ['definitions', 'Test', 'enum', '3'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
        },
      ]);
    });

    test('does not support nullable', async () => {
      const doc = {
        swagger: '2.0',
        definitions: {
          Test: {
            type: 'string',
            nullable: true,
            enum: ['OK', 'FAILED', null],
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([
        {
          code: 'typed-enum',
          message: 'Enum value `null` does not respect the specified type `string`.',
          path: ['definitions', 'Test', 'enum', '2'],
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

    test('identifies enum values which do not respect the type', async () => {
      const doc = {
        openapi: '3.0.0',
        components: {
          schemas: {
            Test: {
              type: 'integer',
              enum: [1, 'a string!', 3, 'and another one!'],
            },
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([
        {
          code: 'typed-enum',
          message: 'Enum value `a string!` does not respect the specified type `integer`.',
          path: ['components', 'schemas', 'Test', 'enum', '1'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
        },
        {
          code: 'typed-enum',
          message: 'Enum value `and another one!` does not respect the specified type `integer`.',
          path: ['components', 'schemas', 'Test', 'enum', '3'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
        },
      ]);
    });

    test('supports nullable', async () => {
      const doc = {
        openapi: '3.0.0',
        components: {
          schemas: {
            Test: {
              type: 'string',
              nullable: true,
              enum: ['OK', 'FAILED', null],
            },
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([]);
    });

    test('supports x-nullable', async () => {
      const doc = {
        swagger: '2.0.0',
        definitions: {
          Test: {
            type: 'string',
            'x-nullable': true,
            enum: ['OK', 'FAILED', null],
          },
        },
      };

      const results = await s.run(doc);

      expect([...results]).toEqual([]);
    });
  });
});
