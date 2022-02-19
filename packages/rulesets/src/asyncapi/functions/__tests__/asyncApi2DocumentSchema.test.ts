import { DiagnosticSeverity } from '@stoplight/types';
import { Spectral } from '@stoplight/spectral-core';
import { prepareResults } from '../asyncApi2DocumentSchema';

import { ErrorObject } from 'ajv';
import { createWithRules } from '../../__tests__/__helpers__/tester';

describe('asyncApi2DocumentSchema', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = createWithRules(['asyncapi-schema']);
  });

  describe('given AsyncAPI 2.0.0 document', () => {
    test('validate invalid info object', async () => {
      expect(
        await s.run({
          asyncapi: '2.0.0',
          info: {
            version: '1.0.1',
            description: 'This is a sample server.',
            termsOfService: 'http://asyncapi.org/terms/',
          },
          channels: {
            '/user/signedup': {
              subscribe: {
                message: {
                  payload: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ).toEqual([
        {
          code: 'asyncapi-schema',
          message: '"info" property must have required property "title"',
          path: ['info'],
          severity: DiagnosticSeverity.Error,
          range: expect.any(Object),
        },
      ]);
    });
  });

  describe('given AsyncAPI 2.1.0 document', () => {
    test('validate with message examples', async () => {
      expect(
        await s.run({
          asyncapi: '2.1.0',
          info: {
            title: 'Signup service example (internal)',
            version: '0.1.0',
          },
          channels: {
            '/user/signedup': {
              subscribe: {
                message: {
                  payload: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                      },
                    },
                  },
                  examples: [
                    {
                      name: 'Example 1',
                      summary: 'Example summary for example 1',
                      payload: {
                        email: 'bye@foo.bar',
                      },
                    },
                  ],
                },
              },
            },
          },
        }),
      ).toEqual([]);
    });
  });

  describe('given AsyncAPI 2.2.0 document', () => {
    test('validate channel with connected server', async () => {
      expect(
        await s.run({
          asyncapi: '2.2.0',
          info: {
            title: 'Signup service example (internal)',
            version: '0.1.0',
          },
          servers: {
            kafka: {
              url: 'development.gigantic-server.com',
              description: 'Development server',
              protocol: 'kafka',
              protocolVersion: '1.0.0',
            },
          },
          channels: {
            '/user/signedup': {
              servers: [1, 'foobar', 3],
              subscribe: {
                message: {
                  payload: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      ).toEqual([
        {
          code: 'asyncapi-schema',
          message: '"0" property type must be string',
          path: ['channels', '/user/signedup', 'servers', '0'],
          severity: DiagnosticSeverity.Error,
          range: expect.any(Object),
        },
        {
          code: 'asyncapi-schema',
          message: '"2" property type must be string',
          path: ['channels', '/user/signedup', 'servers', '2'],
          severity: DiagnosticSeverity.Error,
          range: expect.any(Object),
        },
      ]);
    });
  });

  describe('given AsyncAPI 2.3.0 document', () => {
    test('validate reusable server', async () => {
      expect(
        await s.run({
          asyncapi: '2.3.0',
          info: {
            title: 'Signup service example (internal)',
            version: '0.1.0',
          },
          channels: {
            '/user/signedup': {
              subscribe: {
                message: {
                  payload: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                      },
                    },
                  },
                },
              },
            },
          },
          components: {
            servers: {
              kafka: {
                description: 'Development server',
              },
            },
          },
        }),
      ).toEqual([
        {
          code: 'asyncapi-schema',
          message: '"kafka" property must have required property "url"',
          path: ['components', 'servers', 'kafka'],
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
