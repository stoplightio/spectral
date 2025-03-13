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

const document_v3 = {
  asyncapi: '3.0.0',
  channels: {
    SomeChannel: {
      address: 'users/{userId}/signedUp',
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
    name: 'valid v3 case',
    document: document_v3,
    errors: [],
  },
  {
    name: 'channels.{channel}.parameters.{parameter} lack a description',
    document: produce(document, (draft: any) => {
      delete draft.channels['users/{userId}/signedUp'].parameters.userId.description;
    }),
    errors: [
      {
        message: 'Parameter objects must have "description".',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'userId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'v3 channels.{channel}.parameters.{parameter} lack a description',
    document: produce(document_v3, (draft: any) => {
      delete draft.channels.SomeChannel.parameters.userId.description;
    }),
    errors: [
      {
        message: 'Parameter objects must have "description".',
        path: ['channels', 'SomeChannel', 'parameters', 'userId'],
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
        message: 'Parameter objects must have "description".',
        path: ['components', 'parameters', 'orphanParameter'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'v3 components.parameters.{parameter} lack a description',
    document: produce(document_v3, (draft: any) => {
      delete draft.components.parameters.orphanParameter.description;
    }),
    errors: [
      {
        message: 'Parameter objects must have "description".',
        path: ['components', 'parameters', 'orphanParameter'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
