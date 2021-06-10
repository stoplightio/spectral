import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-parameter-description', [
  {
    name: 'shared parameter without a description',
    document: {
      openapi: '3.0.2',
      components: {
        parameters: {
          address: {
            in: 'body',
          },
        },
      },
    },
    errors: [
      {
        message: 'Parameter objects should have a `description`.',
        path: ['components', 'parameters', 'address'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'shared link without a description',
    document: {
      openapi: '3.0.2',
      components: {
        links: {
          address: {
            operationId: 'getUserAddressByUUID',
            parameters: {
              param: {
                value: 'value',
                in: 'header',
              },
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'links without descriptions in a response',
    document: {
      paths: {
        '/pets': {
          get: {
            responses: {
              '200': {
                links: {
                  abc: {
                    parameters: {
                      param: {
                        in: 'body',
                        val: 2,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
