import { cloneDeep } from 'lodash';
import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from './__helpers__/tester';

const payload = {
  type: 'object',
  properties: {
    value: {
      type: 'integer',
    },
  },
  required: ['value'],
  default: { value: 17 },
};

const document = {
  asyncapi: '2.0.0',
  channels: {
    'users/{userId}/signedUp': {
      publish: {
        message: {
          payload: cloneDeep(payload),
        },
      },
      subscribe: {
        message: {
          payload: cloneDeep(payload),
        },
      },
    },
  },
  components: {
    messageTraits: {
      aTrait: {
        payload: cloneDeep(payload),
      },
    },
    messages: {
      aMessage: {
        payload: cloneDeep(payload),
      },
    },
  },
};

testRule('asyncapi-payload-default', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  {
    name: 'components.messages.{message}.payload.default is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.components.messages.aMessage.payload.default = { seventeen: 17 };
    }),
    errors: [
      {
        message: '"default" property must have required property "value"',
        path: ['components', 'messages', 'aMessage', 'payload', 'default'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'components.messageTraits.{trait}.payload.default is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.components.messageTraits.aTrait.payload.default = { seventeen: 17 };
    }),
    errors: [
      {
        message: '"default" property must have required property "value"',
        path: ['components', 'messageTraits', 'aTrait', 'payload', 'default'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  ...['publish', 'subscribe'].map(property => ({
    name: `channels.{channel}.${property}.message.payload.default is not valid against the schema it decorates`,
    document: produce(document, (draft: any) => {
      draft.channels['users/{userId}/signedUp'][property].message.payload.default = { seventeen: 17 };
    }),
    errors: [
      {
        message: '"default" property must have required property "value"',
        path: ['channels', 'users/{userId}/signedUp', property, 'message', 'payload', 'default'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  })),
]);
