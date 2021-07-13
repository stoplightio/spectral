import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('path-params', [
  {
    name: 'No error if templated path is not used',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo': {
          get: {},
        },
      },
    },
    errors: [],
  },

  {
    name: 'Error if no path parameter definition',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{bar}': {
          get: {},
        },
      },
    },
    errors: [
      {
        message: 'Operation must define parameter "{bar}" as expected by path "/foo/{bar}".',
        path: ['paths', '/foo/{bar}', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'No error if path parameter definition is used (at the path level)',
    document: {
      paths: {
        openapi: '3.0.3',
        paths: {
          '/foo/{bar}': {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
            ],
            get: {},
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'No error if $ref path parameter definition is used (at the path level)',
    document: {
      paths: {
        openapi: '3.0.3',
        paths: {
          '/foo/{bar}': {
            parameters: [
              {
                $ref: '#/definitions/barParam',
              },
            ],
            get: {},
          },
        },
      },
      definitions: {
        barParam: {
          name: 'bar',
          in: 'path',
          required: true,
        },
      },
    },
    errors: [],
  },

  {
    name: 'No error if path parameter definition is set (at the operation level)',
    document: {
      paths: {
        openapi: '3.0.3',
        paths: {
          '/foo/{bar}': {
            get: {
              parameters: [
                {
                  name: 'bar',
                  in: 'path',
                  required: true,
                },
              ],
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'No errors if operation is a not a standard HTTP operation.',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{bar}': {
          'x-not-a-standard-operation': {},
        },
      },
    },
    errors: [],
  },

  {
    name: 'Error if path parameter definition is set (at the operation level) for a method, but forgotten for another one',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{bar}': {
          get: {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
            ],
          },
          put: {},
        },
      },
    },

    errors: [
      {
        message: 'Operation must define parameter "{bar}" as expected by path "/foo/{bar}".',
        path: ['paths', '/foo/{bar}', 'put'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'Error if duplicate path parameters with same name are used',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{bar}/{bar}': {
          parameters: [
            {
              name: 'bar',
              in: 'path',
              required: true,
            },
          ],
          get: {},
        },
      },
    },
    errors: [
      {
        message: 'Path "/foo/{bar}/{bar}" must not use parameter "{bar}" multiple times.',
        path: ['paths', '/foo/{bar}/{bar}'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'Error if $ref path parameter definition is not required',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{bar}': {
          parameters: [
            {
              $ref: '#/definitions/barParam',
            },
          ],
          get: {},
        },
      },
      definitions: {
        barParam: {
          name: 'bar',
          in: 'path',
          required: false,
        },
      },
    },
    errors: [
      {
        message: `Path parameter "bar" must have "required" property that is set to "true".`,
        path: ['paths', '/foo/{bar}', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'Error if $ref operation parameter definition is not required',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{bar}': {
          get: {
            parameters: [
              {
                $ref: '#/definitions/barParam',
              },
            ],
          },
        },
      },
      definitions: {
        barParam: {
          name: 'bar',
          in: 'path',
          required: false,
        },
      },
    },
    errors: [
      {
        message: `Path parameter "bar" must have "required" property that is set to "true".`,
        path: ['paths', '/foo/{bar}', 'get', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'Error if paths are functionally equivalent',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{boo}': {
          parameters: [
            {
              name: 'boo',
              in: 'path',
              required: true,
            },
          ],
          get: {},
        },
        '/foo/{bar}': {
          parameters: [
            {
              name: 'bar',
              in: 'path',
              required: true,
            },
          ],
          get: {},
        },
      },
    },

    errors: [
      {
        message: `Paths "/foo/{boo}" and "/foo/{bar}" must not be equivalent.`,
        path: ['paths', '/foo/{bar}'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'Error if path parameter definition is set (at the global and/or operation level), but unused',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo': {
          parameters: [
            {
              name: 'boo',
              in: 'path',
              required: true,
            },
          ],
          get: {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
            ],
          },
          put: {
            parameters: [
              {
                name: 'baz',
                in: 'path',
                required: true,
              },
              {
                name: 'qux',
                in: 'path',
                required: true,
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Parameter "boo" must be used in path "/foo".',
        path: ['paths', '/foo', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Parameter "bar" must be used in path "/foo".',
        path: ['paths', '/foo', 'get', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Parameter "baz" must be used in path "/foo".',
        path: ['paths', '/foo', 'put', 'parameters', '0'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Parameter "qux" must be used in path "/foo".',
        path: ['paths', '/foo', 'put', 'parameters', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'Error if path parameter are defined multiple times',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{boo}/{bar}/{qux}': {
          parameters: [
            {
              name: 'boo',
              in: 'path',
              required: true,
            },
            {
              name: 'boo',
              in: 'path',
              required: true,
            },
            {
              name: 'bar',
              in: 'path',
              required: true,
            },
          ],
          get: {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
              {
                name: 'bar',
                in: 'path',
                required: true,
              },
              {
                name: 'qux',
                in: 'path',
                required: true,
              },
            ],
          },
          put: {
            parameters: [
              {
                name: 'qux',
                in: 'path',
                required: true,
              },
              {
                name: 'qux',
                in: 'path',
                required: true,
              },
            ],
          },
        },
      },
    },

    errors: [
      {
        message: 'Path parameter "boo" must not be defined multiple times.',
        path: ['paths', '/foo/{boo}/{bar}/{qux}', 'parameters', '1'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Path parameter "bar" must not be defined multiple times.',
        path: ['paths', '/foo/{boo}/{bar}/{qux}', 'get', 'parameters', '1'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Path parameter "qux" must not be defined multiple times.',
        path: ['paths', '/foo/{boo}/{bar}/{qux}', 'put', 'parameters', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'No error if two parameters bear the same name but target different locations',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{boo}': {
          parameters: [
            {
              name: 'boo',
              in: 'path',
              required: true,
            },
          ],
          get: {
            parameters: [
              {
                name: 'boo',
                in: 'header',
              },
            ],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'No error if path parameter definition has override at the operation level',
    document: {
      openapi: '3.0.3',
      paths: {
        '/foo/{bar}': {
          parameters: [
            {
              name: 'bar',
              in: 'path',
              required: true,
              description: 'Shared common parameter.',
            },
          ],
          get: {
            parameters: [
              {
                name: 'bar',
                in: 'path',
                required: true,
                description: 'Operation level parameter.',
              },
            ],
          },
        },
      },
    },
    errors: [],
  },
]);
