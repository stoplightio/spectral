import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-parameter-description', [
  {
    name: 'valid shared level parameters',
    document: {
      swagger: '2.0',
      parameters: {
        limit: {
          name: 'limit',
          in: 'query',
          description: 'This is how it works.',
          type: 'integer',
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid top level path parameters',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: 'This is how it works.',
              type: 'integer',
            },
          ],
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid operation level parameters',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            parameters: [
              {
                name: 'limit',
                in: 'query',
                description: 'This is how it works.',
                type: 'integer',
              },
            ],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'top level path parameter description is missing',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [
            {
              name: 'limit',
              in: 'query',
              type: 'integer',
            },
          ],
        },
      },
    },
    errors: [
      {
        message: 'Parameter objects must have "description".',
        path: ['paths', '/todos', 'parameters', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'operation level parameter description is missing',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            parameters: [
              {
                name: 'limit',
                in: 'query',
                type: 'integer',
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Parameter objects must have "description".',
        path: ['paths', '/todos', 'get', 'parameters', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'does not throw on refs',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [
            {
              $ref: '#/parameters/limit',
            },
          ],
        },
      },
    },
    errors: [],
  },

  {
    name: 'shared level parameter description is missing',
    document: {
      swagger: '2.0',
      parameters: {
        limit: {
          name: 'limit',
          in: 'query',
          type: 'integer',
        },
      },
    },
    errors: [
      {
        message: 'Parameter objects must have "description".',
        path: ['parameters', 'limit'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
