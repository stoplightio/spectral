import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('operation-success-response', [
  {
    name: '200 response is set',
    document: {
      swagger: '2.0',
      paths: {
        '/path': {
          get: {
            responses: {
              '200': {},
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'is happy when a 301 response is set',
    document: {
      swagger: '2.0',
      paths: {
        '/path': {
          get: {
            responses: {
              '301': {},
            },
          },
        },
      },
    },

    errors: [],
  },

  {
    name: 'is happy when a (non 200) success response is set',
    document: {
      swagger: '2.0',
      paths: {
        '/path': {
          get: {
            responses: {
              '204': {},
            },
          },
        },
      },
    },
    errors: [],
  },

  ...['put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].map(verb => ({
    name: `HTTP verb ${verb} is missing a success response`,
    document: {
      swagger: '2.0',
      paths: {
        '/path': {
          [verb]: {
            responses: {
              '418': {},
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Operation must have at least one "2xx" or "3xx" response.',
        path: ['paths', '/path', verb, 'responses'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  })),

  {
    name: 'missing success response',
    document: {
      swagger: '2.0',
      paths: {
        '/path': {
          get: {
            responses: {
              400: {},
            },
          },
        },
      },
    },

    errors: [
      {
        message: 'Operation must have at least one "2xx" or "3xx" response.',
        path: ['paths', '/path', 'get', 'responses'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'PathItem level which is not a HTTP method',
    document: {
      swagger: '2.0',
      paths: {
        '/path': {
          'x-summary': 'why is this here',
        },
      },
    },
    errors: [],
  },

  {
    name: 'path has no responses',
    document: {
      swagger: '2.0',
      paths: {
        '/test': {
          get: {
            operationId: '123',
          },
          post: {
            operationId: '123',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'oas2 document has 2XX and 3XX responses set',
    document: {
      swagger: '2.0',
      paths: {
        '/path': {
          get: {
            responses: {
              '3XX': {},
            },
          },
          post: {
            responses: {
              '2XX': {},
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Operation must have at least one "2xx" or "3xx" response.',
        path: ['paths', '/path', 'get', 'responses'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Operation must have at least one "2xx" or "3xx" response.',
        path: ['paths', '/path', 'post', 'responses'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'oas 3.0.x document has 2XX and 3XX responses set',
    document: {
      openapi: '3.0.3',
      paths: {
        '/path': {
          get: {
            responses: {
              '3XX': {},
            },
          },
          post: {
            responses: {
              '2XX': {},
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'oas 3.1.x document has 2XX and 3XX responses set',
    document: {
      openapi: '3.1.0',
      paths: {
        '/path': {
          get: {
            responses: {
              '3XX': {},
            },
          },
          post: {
            responses: {
              '2XX': {},
            },
          },
        },
      },
    },
    errors: [],
  },
]);
