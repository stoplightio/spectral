import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('typed-enum', [
  {
    name: 'oas2: empty object',
    document: {
      swagger: '2.0',
    },
    errors: [],
  },

  {
    name: 'oas2: the model is valid',
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
    name: 'oas2: values which do not respect the type',
    document: {
      swagger: '2.0',
      definitions: {
        Test: {
          type: 'integer',
          enum: [1, 'a string!', 3, 'and another one!'],
        },
      },
    },
    errors: [
      {
        message: 'Enum value `a string!` must be "integer".',
        path: ['definitions', 'Test', 'enum', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Enum value `and another one!` must be "integer".',
        path: ['definitions', 'Test', 'enum', '3'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'oas2: nullable is not supported',
    document: {
      swagger: '2.0',
      definitions: {
        Test: {
          type: 'string',
          nullable: true,
          enum: ['OK', 'FAILED', null],
        },
      },
    },
    errors: [
      {
        code: 'typed-enum',
        message: 'Enum value `null` must be "string".',
        path: ['definitions', 'Test', 'enum', '2'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'oas2: x-nullable is supported',
    document: {
      swagger: '2.0.0',
      definitions: {
        Test: {
          type: 'string',
          'x-nullable': true,
          enum: ['OK', 'FAILED', null],
        },
      },
    },
    errors: [],
  },

  {
    name: 'oas3: empty object',
    document: {
      openapi: '3.0.0',
    },
    errors: [],
  },

  {
    name: 'oas3: the model is valid',
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
    name: 'oas3: values which do not respect the type',
    document: {
      openapi: '3.0.0',
      components: {
        schemas: {
          Test: {
            type: 'integer',
            enum: [1, 'a string!', 3, 'and another one!'],
          },
        },
      },
    },
    errors: [
      {
        message: 'Enum value `a string!` must be "integer".',
        path: ['components', 'schemas', 'Test', 'enum', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Enum value `and another one!` must be "integer".',
        path: ['components', 'schemas', 'Test', 'enum', '3'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'oas3: nullable is supported',
    document: {
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
    },
    errors: [],
  },
]);
