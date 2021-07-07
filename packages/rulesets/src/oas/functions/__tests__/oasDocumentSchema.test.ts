import { DiagnosticSeverity } from '@stoplight/types';
import { Spectral } from '@stoplight/spectral-core';
import { prepareResults } from '../oasDocumentSchema';

import { ErrorObject } from 'ajv';
import { createWithRules } from '../../__tests__/__helpers__/tester';

describe('oasDocumentSchema', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = createWithRules(['oas2-schema', 'oas3-schema']);
  });

  describe('given OpenAPI 2 document', () => {
    test('validate security definitions', async () => {
      expect(
        await s.run({
          swagger: '2.0',
          info: {
            title: 'response example',
            version: '1.0',
          },
          paths: {
            '/user': {
              get: {
                responses: {
                  200: {
                    description: 'dummy description',
                  },
                },
              },
            },
          },
          securityDefinitions: {
            basic: null,
          },
        }),
      ).toEqual([
        {
          code: 'oas2-schema',
          message: 'Invalid basic authentication security definition.',
          path: ['securityDefinitions', 'basic'],
          severity: DiagnosticSeverity.Error,
          range: expect.any(Object),
        },
      ]);
    });
  });

  describe('given OpenAPI 3 document', () => {
    test('validate parameters', async () => {
      expect(
        await s.run({
          openapi: '3.0.1',
          info: {
            title: 'response example',
            version: '1.0',
          },
          paths: {
            '/user': {
              get: {
                responses: {
                  200: {
                    description: 'dummy description',
                  },
                },
                parameters: [
                  {
                    name: 'module_id',
                    in: 'bar',
                    required: true,
                    schema: {
                      type: ['string', 'number'],
                    },
                  },
                ],
              },
            },
          },
        }),
      ).toEqual([
        {
          code: 'oas3-schema',
          message: '"type" property type must be string.',
          path: ['paths', '/user', 'get', 'parameters', '0', 'schema', 'type'],
          severity: DiagnosticSeverity.Error,
          range: expect.any(Object),
        },
      ]);
    });

    test('validate security schemes', async () => {
      expect(
        await s.run({
          openapi: '3.0.1',
          info: {
            title: 'response example',
            version: '1.0',
          },
          paths: {
            '/user': {
              get: {
                responses: {
                  200: {
                    description: 'dummy description',
                  },
                },
              },
            },
          },
          components: {
            securitySchemes: {
              basic: {
                foo: 2,
              },
            },
          },
        }),
      ).toEqual([
        {
          code: 'oas3-schema',
          message: 'Invalid security scheme.',
          path: ['components', 'securitySchemes', 'basic'],
          severity: DiagnosticSeverity.Error,
          range: expect.any(Object),
        },
        {
          code: 'oas3-schema',
          message: 'Property "foo" is not expected to be here.',
          path: ['components', 'securitySchemes', 'basic', 'foo'],
          severity: DiagnosticSeverity.Error,
          range: expect.any(Object),
        },
      ]);
    });

    test('validate responses', async () => {
      expect(
        await s.run({
          openapi: '3.0.1',
          info: {
            title: 'response example',
            version: '1.0',
          },
          paths: {
            '/user': {
              get: {
                operationId: 'd',
                responses: {
                  200: {},
                },
              },
            },
          },
        }),
      ).toEqual([
        {
          code: 'oas3-schema',
          message: '"200" property must have required property "description".',
          path: ['paths', '/user', 'get', 'responses', '200'],
          severity: DiagnosticSeverity.Error,
          range: expect.any(Object),
        },
      ]);
    });
  });

  describe('prepareResults', () => {
    test('given oneOf error one of which is required $ref property missing, picks only one error', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'must be string',
        },
        {
          keyword: 'required',
          instancePath: '/paths/test/post/parameters/0/schema',
          schemaPath: '#/definitions/Reference/required',
          params: { missingProperty: '$ref' },
          message: "must have required property '$ref'",
        },
        {
          keyword: 'oneOf',
          instancePath: '/paths/test/post/parameters/0/schema',
          schemaPath: '#/properties/schema/oneOf',
          params: { passingSchemas: null },
          message: 'must match exactly one schema in oneOf',
        },
      ];

      prepareResults(errors);

      expect(errors).toStrictEqual([
        {
          keyword: 'type',
          instancePath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'must be string',
        },
      ]);
    });

    test('given oneOf error one without any $ref property missing, picks all errors', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'must be string',
        },
        {
          keyword: 'type',
          instancePath: '/paths/test/post/parameters/1/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'must be string',
        },
        {
          keyword: 'oneOf',
          instancePath: '/paths/test/post/parameters/0/schema',
          schemaPath: '#/properties/schema/oneOf',
          params: { passingSchemas: null },
          message: 'must match exactly one schema in oneOf',
        },
      ];

      prepareResults(errors);

      expect(errors).toStrictEqual([
        {
          keyword: 'type',
          instancePath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'must be string',
        },
        {
          instancePath: '/paths/test/post/parameters/1/schema/type',
          keyword: 'type',
          message: 'must be string',
          params: {
            type: 'string',
          },
          schemaPath: '#/properties/type/type',
        },
        {
          instancePath: '/paths/test/post/parameters/0/schema',
          keyword: 'oneOf',
          message: 'must match exactly one schema in oneOf',
          params: {
            passingSchemas: null,
          },
          schemaPath: '#/properties/schema/oneOf',
        },
      ]);
    });

    test('given errors with different data paths, picks all errors', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          instancePath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'must be string',
        },
        {
          keyword: 'required',
          instancePath: '/paths/foo/post/parameters/0/schema',
          schemaPath: '#/definitions/Reference/required',
          params: { missingProperty: '$ref' },
          message: "must have required property '$ref'",
        },
        {
          keyword: 'oneOf',
          instancePath: '/paths/baz/post/parameters/0/schema',
          schemaPath: '#/properties/schema/oneOf',
          params: { passingSchemas: null },
          message: 'must match exactly one schema in oneOf',
        },
      ];

      prepareResults(errors);

      expect(errors).toStrictEqual([
        {
          instancePath: '/paths/test/post/parameters/0/schema/type',
          keyword: 'type',
          message: 'must be string',
          params: {
            type: 'string',
          },
          schemaPath: '#/properties/type/type',
        },
        {
          instancePath: '/paths/foo/post/parameters/0/schema',
          keyword: 'required',
          message: "must have required property '$ref'",
          params: {
            missingProperty: '$ref',
          },
          schemaPath: '#/definitions/Reference/required',
        },
        {
          instancePath: '/paths/baz/post/parameters/0/schema',
          keyword: 'oneOf',
          message: 'must match exactly one schema in oneOf',
          params: {
            passingSchemas: null,
          },
          schemaPath: '#/properties/schema/oneOf',
        },
      ]);
    });
  });
});
