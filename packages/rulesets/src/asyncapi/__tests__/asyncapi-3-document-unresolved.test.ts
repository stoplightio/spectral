import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-document-unresolved', [
  {
    name: 'valid case AsyncAPI 3',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
    },
    errors: [],
  },
  {
    name: 'valid case unresolved case message',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
      channels: {
        SomeChannel: {
          address: 'users/{userId}/signedUp',
          messages: {
            SomeMessage: { $ref: '#/components/messages/SomeMessage' },
          },
        },
      },
      components: {
        messages: {
          SomeMessage: { payload: { type: 'string' } },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid AsyncAPI 3 unresolved case operations',
    document: {
      asyncapi: '3.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
      channels: {
        SomeChannel: {
          address: 'users/{userId}/signedUp',
          messages: {
            SomeMessage: { $ref: '#/x-SomeMessage' },
          },
        },
      },
      operations: {
        SomeOperation: {
          action: 'send',
          channel: {
            $ref: '#/channels/SomeChannel',
          },
          messages: [{ $ref: '#/channels/SomeChannel' }],
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid case for 3.0.0 (reference for info object is not allowed)',
    document: {
      asyncapi: '3.0.0',
      info: {
        $ref: '#/components/x-titles/someTitle',
      },
      components: {
        'x-titles': {
          someTitle: 'some-title',
        },
      },
    },
    errors: [
      {
        message: 'Referencing in this place is not allowed',
        path: ['info'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
