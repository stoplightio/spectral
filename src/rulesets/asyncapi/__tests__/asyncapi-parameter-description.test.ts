import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from './__helpers__/tester';

const document = {
  asyncapi: '2.0.0',
  channels: {
    'users/{userId}/signedUp': {
      parameters: {
        userId: {
          description: 'The identifier of the user being tracked.',
        },
      },
    },
  },
  components: {
    parameters: {
      orphanParameter: {
        description: 'A defined, but orphaned, parameter.',
      },
    },
  },
};

testRule('asyncapi-parameter-description', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  {
    name: 'channels.{channel}.parameters.{parameter} lack a description',
    document: produce(document, (draft: any) => {
      delete draft.channels['users/{userId}/signedUp'].parameters.userId.description;
    }),
    errors: [
      {
        message: 'Parameter objects should have a `description`.',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'components.parameters.{parameter} lack a description',
    document: produce(document, (draft: any) => {
      delete draft.components.parameters.orphanParameter.description;
    }),
    errors: [
      {
        message: 'Parameter objects should have a `description`.',
        path: ['components', 'parameters', 'orphanParameter'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
