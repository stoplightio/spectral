import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from './__helpers__/tester';

const document = {
  asyncapi: '2.0.0',
  channels: {
    'users/{userId}/signedUp': {
      publish: {
        message: {},
      },
      subscribe: {
        message: {},
      },
    },
  },
  components: {
    messageTraits: {
      aTrait: {},
    },
    messages: {
      aMessage: {},
    },
  },
};

testRule('asyncapi-payload-unsupported-schemaFormat', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  {
    name: 'components.messages.{message}.schemaFormat is set to a non supported value',
    document: produce(document, (draft: any) => {
      draft.components.messages.aMessage.schemaFormat = 'application/nope';
    }),
    errors: [
      {
        message: 'Message schema validation is only supported with default unspecified `schemaFormat`.',
        path: ['components', 'messages', 'aMessage', 'schemaFormat'],
        severity: DiagnosticSeverity.Information,
      },
    ],
  },

  {
    name: 'components.messageTraits.{trait}.schemaFormat is set to a non supported value',
    document: produce(document, (draft: any) => {
      draft.components.messageTraits.aTrait.schemaFormat = 'application/nope';
    }),
    errors: [
      {
        message: 'Message schema validation is only supported with default unspecified `schemaFormat`.',
        path: ['components', 'messageTraits', 'aTrait', 'schemaFormat'],
        severity: DiagnosticSeverity.Information,
      },
    ],
  },

  ...['publish', 'subscribe'].map(property => ({
    name: `channels.{channel}.${property}.message.schemaFormat is set to a non supported value`,
    document: produce(document, draft => {
      draft.channels['users/{userId}/signedUp'][property].message.schemaFormat = 'application/nope';
    }),
    errors: [
      {
        message: 'Message schema validation is only supported with default unspecified `schemaFormat`.',
        path: ['channels', 'users/{userId}/signedUp', property, 'message', 'schemaFormat'],
        severity: DiagnosticSeverity.Information,
      },
    ],
  })),
]);
