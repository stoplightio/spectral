import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import { cloneDeep } from 'lodash';
import testRule from './__helpers__/tester';

const payload = {
  type: 'object',
  properties: {
    value: {
      type: 'integer',
    },
  },
  required: ['value'],
  examples: [{ value: 17 }, { value: 18 }],
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

testRule('asyncapi-payload-examples', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  {
    name: 'components.messages.{message}.payload.examples.{position} is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.components.messages.aMessage.payload.examples[1] = { seventeen: 17 };
    }),
    errors: [
      {
        message: '`1` property must have required property `value`',
        path: ['components', 'messages', 'aMessage', 'payload', 'examples', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'components.messageTraits.{trait}.payload.examples.{position} is not valid against the schema it decorates',
    document: produce(document, (draft: any) => {
      draft.components.messageTraits.aTrait.payload.examples[1] = { seventeen: 17 };
    }),
    errors: [
      {
        message: '`1` property must have required property `value`',
        path: ['components', 'messageTraits', 'aTrait', 'payload', 'examples', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  ...['publish', 'subscribe'].map(property => ({
    name: `channels.{channel}.${property}.message.payload.examples.{position} is not valid against the schema it decorates`,
    document: produce(document, (draft: any) => {
      draft.channels['users/{userId}/signedUp'][property].message.payload.examples[1] = { seventeen: 17 };
    }),
    errors: [
      {
        message: '`1` property must have required property `value`',
        path: ['channels', 'users/{userId}/signedUp', property, 'message', 'payload', 'examples', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  })),
]);
