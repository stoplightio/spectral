import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-schema-unresolved', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
      channels: {
        someChannel: {
          publish: {
            message: {
              $ref: '#/components/messages/someMessage',
            },
          },
        },
      },
      components: {
        messages: {
          someMessage: {},
        },
      },
    },
    errors: [],
  },

  {
    name: 'invalid case (reference for operation object is not allowed)',
    document: {
      asyncapi: '2.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
      channels: {
        someChannel: {
          publish: {
            $ref: '#/components/x-operations/someOperation',
          },
        },
      },
      components: {
        'x-operations': {
          someOperation: {},
        },
      },
    },
    errors: [
      {
        message: 'Referencing here is not allowed',
        path: ['channels', 'someChannel', 'publish', '$ref'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (case when other errors should also occur but we filter them out - required info field is omitted)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            $ref: '#/components/x-operations/someOperation',
          },
        },
      },
      components: {
        'x-operations': {
          someOperation: {},
        },
      },
    },
    errors: [
      {
        message: 'Referencing here is not allowed',
        path: ['channels', 'someChannel', 'publish', '$ref'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
