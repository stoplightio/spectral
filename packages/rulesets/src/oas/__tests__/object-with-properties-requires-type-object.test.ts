import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('object-with-properties-requires-type-object', [
  {
    name: 'oas3: valid object schema with properties',
    document: {
      openapi: '3.0.0',
      paths: {},
      components: {
        schemas: {
          Address: {
            type: 'object',
            properties: {
              number: { type: 'number' },
              street_name: { type: 'string' },
            },
            required: ['number'],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'oas3: properties without type is invalid',
    document: {
      openapi: '3.0.0',
      paths: {},
      components: {
        schemas: {
          Address: {
            properties: {
              number: { type: 'number' },
              street_name: { type: 'string' },
            },
            required: ['number'],
          },
        },
      },
    },
    errors: [
      {
        message: 'Schemas with "properties" must declare "type: object".',
        path: ['components', 'schemas', 'Address'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'oas3: properties with non-object type is invalid',
    document: {
      openapi: '3.0.0',
      paths: {},
      components: {
        schemas: {
          Address: {
            type: 'string',
            properties: {
              number: { type: 'number' },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Schemas with "properties" must declare "type: object".',
        path: ['components', 'schemas', 'Address', 'type'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'oas2: valid definition with type object',
    document: {
      swagger: '2.0',
      paths: {},
      definitions: {
        Pet: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'oas2: definition with properties but missing type',
    document: {
      swagger: '2.0',
      paths: {},
      definitions: {
        Pet: {
          properties: {
            name: { type: 'string' },
          },
        },
      },
    },
    errors: [
      {
        message: 'Schemas with "properties" must declare "type: object".',
        path: ['definitions', 'Pet'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
