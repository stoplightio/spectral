import { DiagnosticSeverity } from '@stoplight/types';
import { isOpenApiv2, isOpenApiv3, RuleType, Spectral } from '../../../..';
import { functions } from '../../../../functions';
import { setFunctionContext } from '../../../evaluators';
import { rules } from '../../index.json';
import oasDocumentSchema, { prepareResults } from '../oasDocumentSchema';

import { ErrorObject } from 'ajv';
import { normalizeSeverityFromJsonRuleset } from '../../../../../setupTests';
import * as oas2Schema from '../../schemas/schema.oas2.json';
import * as oas3Schema from '../../schemas/schema.oas3.json';

describe('oasDocumentSchema', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();

    s.registerFormat('oas2', isOpenApiv2);
    s.registerFormat('oas3', isOpenApiv3);
    s.setFunctions({ oasDocumentSchema: setFunctionContext({ functions }, oasDocumentSchema) });
    s.setRules({
      'oas2-schema': {
        ...rules['oas2-schema'],
        severity: normalizeSeverityFromJsonRuleset(rules['oas2-schema'].severity),
        type: RuleType[rules['oas2-schema'].type],
        then: {
          ...rules['oas2-schema'].then,
          functionOptions: {
            ...rules['oas2-schema'].then.functionOptions,
            schema: oas2Schema,
          },
        },
      },
      'oas3-schema': {
        ...rules['oas3-schema'],
        severity: normalizeSeverityFromJsonRuleset(rules['oas3-schema'].severity),
        type: RuleType[rules['oas3-schema'].type],
        then: {
          ...rules['oas3-schema'].then,
          functionOptions: {
            ...rules['oas3-schema'].then.functionOptions,
            schema: oas3Schema,
          },
        },
      },
    });
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
          message: 'Invalid security definition.',
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
          message: '`type` property type should be string.',
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
          message: '`200` property should have required property `description`.',
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
          dataPath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'should be string',
        },
        {
          keyword: 'required',
          dataPath: '/paths/test/post/parameters/0/schema',
          schemaPath: '#/definitions/Reference/required',
          params: { missingProperty: '$ref' },
          message: "should have required property '$ref'",
        },
        {
          keyword: 'oneOf',
          dataPath: '/paths/test/post/parameters/0/schema',
          schemaPath: '#/properties/schema/oneOf',
          params: { passingSchemas: null },
          message: 'should match exactly one schema in oneOf',
        },
      ];

      prepareResults(errors);

      expect(errors).toStrictEqual([
        {
          keyword: 'type',
          dataPath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'should be string',
        },
      ]);
    });

    test('given oneOf error one without any $ref property missing, picks all errors', () => {
      const errors: ErrorObject[] = [
        {
          keyword: 'type',
          dataPath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'should be string',
        },
        {
          keyword: 'type',
          dataPath: '/paths/test/post/parameters/1/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'should be string',
        },
        {
          keyword: 'oneOf',
          dataPath: '/paths/test/post/parameters/0/schema',
          schemaPath: '#/properties/schema/oneOf',
          params: { passingSchemas: null },
          message: 'should match exactly one schema in oneOf',
        },
      ];

      prepareResults(errors);

      expect(errors).toStrictEqual([
        {
          keyword: 'type',
          dataPath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'should be string',
        },
        {
          dataPath: '/paths/test/post/parameters/1/schema/type',
          keyword: 'type',
          message: 'should be string',
          params: {
            type: 'string',
          },
          schemaPath: '#/properties/type/type',
        },
        {
          dataPath: '/paths/test/post/parameters/0/schema',
          keyword: 'oneOf',
          message: 'should match exactly one schema in oneOf',
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
          dataPath: '/paths/test/post/parameters/0/schema/type',
          schemaPath: '#/properties/type/type',
          params: { type: 'string' },
          message: 'should be string',
        },
        {
          keyword: 'required',
          dataPath: '/paths/foo/post/parameters/0/schema',
          schemaPath: '#/definitions/Reference/required',
          params: { missingProperty: '$ref' },
          message: "should have required property '$ref'",
        },
        {
          keyword: 'oneOf',
          dataPath: '/paths/baz/post/parameters/0/schema',
          schemaPath: '#/properties/schema/oneOf',
          params: { passingSchemas: null },
          message: 'should match exactly one schema in oneOf',
        },
      ];

      prepareResults(errors);

      expect(errors).toStrictEqual([
        {
          dataPath: '/paths/test/post/parameters/0/schema/type',
          keyword: 'type',
          message: 'should be string',
          params: {
            type: 'string',
          },
          schemaPath: '#/properties/type/type',
        },
        {
          dataPath: '/paths/foo/post/parameters/0/schema',
          keyword: 'required',
          message: "should have required property '$ref'",
          params: {
            missingProperty: '$ref',
          },
          schemaPath: '#/definitions/Reference/required',
        },
        {
          dataPath: '/paths/baz/post/parameters/0/schema',
          keyword: 'oneOf',
          message: 'should match exactly one schema in oneOf',
          params: {
            passingSchemas: null,
          },
          schemaPath: '#/properties/schema/oneOf',
        },
      ]);
    });
  });
});
