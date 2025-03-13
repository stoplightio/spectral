import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from './__helpers__/tester';

const document = {
  asyncapi: '2.0.0',
  channels: {
    'users/signedUp': {
      subscribe: {
        message: {
          payload: {
            $ref: '#/components/schemas/externallyDefinedUser',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      externallyDefinedUser: {
        type: 'string',
      },
    },
  },
};

const document_v3 = {
  asyncapi: '3.0.0',
  channels: {
    SomeChannel: {
      address: 'users/signedUp',
      messages: [
        {
          payload: {
            $ref: '#/components/schemas/externallyDefinedUser',
          },
        },
      ],
    },
  },
  components: {
    schemas: {
      externallyDefinedUser: {
        type: 'string',
      },
    },
  },
};

testRule('asyncapi-unused-components-schema', [
  {
    name: 'valid case',
    document,
    errors: [],
  },
  {
    name: 'valid v3 case',
    document: document_v3,
    errors: [],
  },
  {
    name: 'v3 components.schemas contains unreferenced objects',
    document: produce(document_v3, (draft: any) => {
      delete draft.channels['SomeChannel'];

      draft.channels['SomeChannel'] = {
        messages: [
          {
            payload: {
              type: 'string',
            },
          },
        ],
      };
    }),
    errors: [
      {
        message: 'Potentially unused components schema has been detected.',
        path: ['components', 'schemas', 'externallyDefinedUser'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'components.schemas contains unreferenced objects',
    document: produce(document, (draft: any) => {
      delete draft.channels['users/signedUp'];

      draft.channels['users/signedOut'] = {
        subscribe: {
          message: {
            payload: {
              type: 'string',
            },
          },
        },
      };
    }),
    errors: [
      {
        message: 'Potentially unused components schema has been detected.',
        path: ['components', 'schemas', 'externallyDefinedUser'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
