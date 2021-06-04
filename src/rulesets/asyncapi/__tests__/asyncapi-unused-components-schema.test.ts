import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from '../../__tests__/__helpers__/tester';

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

testRule('asyncapi-unused-components-schema', [
  {
    name: 'valid case',
    document,
    errors: [],
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
