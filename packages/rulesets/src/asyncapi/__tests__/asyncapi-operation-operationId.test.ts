import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-operation-operationId', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.4.0',
      channels: {
        one: {
          publish: {
            operationId: 'firstId',
          },
          subscribe: {
            operationId: 'secondId',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid case (with traits)',
    document: {
      asyncapi: '2.4.0',
      channels: {
        one: {
          publish: {
            traits: [
              {},
              {
                operationId: 'firstId',
              },
            ],
          },
          subscribe: {
            operationId: 'secondId',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'invalid case',
    document: {
      asyncapi: '2.4.0',
      channels: {
        one: {
          publish: {},
          subscribe: {},
        },
      },
    },
    errors: [
      {
        message: 'Operation must have an "operationId" field defined.',
        path: ['channels', 'one', 'publish'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Operation must have an "operationId" field defined.',
        path: ['channels', 'one', 'subscribe'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (with traits)',
    document: {
      asyncapi: '2.4.0',
      channels: {
        one: {
          publish: {
            traits: [{}, {}],
          },
          subscribe: {
            operationId: 'secondId',
          },
        },
      },
    },
    errors: [
      {
        message: 'Operation must have an "operationId" field defined.',
        path: ['channels', 'one', 'publish'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
