import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('duplicated-entry-in-enum', [
  {
    name: 'oas2: empty object',
    document: {
      swagger: '2.0',
    },
    errors: [],
  },

  {
    name: 'oas2: valid mode',
    document: {
      swagger: '2.0',
      definitions: {
        Test: {
          type: 'integer',
          enum: [1, 2, 3],
        },
      },
    },
    errors: [],
  },

  {
    name: 'oas2: enum is an object property',
    document: {
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
    },

    errors: [],
  },

  {
    name: 'oas2: enum with duplicated entries',
    document: {
      swagger: '2.0',
      definitions: {
        Test: {
          type: 'integer',
          enum: [1, 2, 3, 4, 5, 2],
        },
      },
    },

    errors: [
      {
        message: `A duplicated entry in the enum was found. Error: "enum" property must not have duplicate items (items ## 1 and 5 are identical)`,
        path: ['definitions', 'Test', 'enum'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'oas3: empty object',
    document: {
      openapi: '3.0.0',
    },
    errors: [],
  },

  {
    name: 'oas3: valid model',
    document: {
      openapi: '3.0.0',
      components: {
        schemas: {
          Test: {
            type: 'integer',
            enum: [1, 2, 3],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'osa3: enum with duplicated entries',
    document: {
      openapi: '3.0.0',
      components: {
        schemas: {
          Test: {
            type: 'integer',
            enum: [1, 2, 3, 4, 5, 2],
          },
        },
      },
    },
    errors: [
      {
        message: `A duplicated entry in the enum was found. Error: "enum" property must not have duplicate items (items ## 1 and 5 are identical)`,
        path: ['components', 'schemas', 'Test', 'enum'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
