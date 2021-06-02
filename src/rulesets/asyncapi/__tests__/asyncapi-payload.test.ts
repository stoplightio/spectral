import { DiagnosticSeverity } from '@stoplight/types';
import { cloneDeep } from 'lodash';
import produce from 'immer';
import testRule from './__helpers__/runner';

const payload = {
  type: 'object',
  properties: {
    value: {
      type: 'integer',
    },
  },
  required: ['value'],
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

testRule('asyncapi-payload', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  {
    name: 'components.messages.{message}.payload is not valid against the AsyncApi2 schema object',
    document: produce(document, (draft: any) => {
      draft.components.messages.aMessage.payload.deprecated = 17;
    }),
    errors: [
      {
        message: '`deprecated` property type must be boolean',
        path: ['components', 'messages', 'aMessage', 'payload', 'deprecated'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'components.messageTraits.{trait}.payload is not valid against the AsyncApi2 schema object',
    document: produce(document, (draft: any) => {
      draft.components.messageTraits.aTrait.payload.deprecated = 17;
    }),
    errors: [
      {
        message: '`deprecated` property type must be boolean',
        path: ['components', 'messageTraits', 'aTrait', 'payload', 'deprecated'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  ...['publish', 'subscribe'].map(property => ({
    name: `channels.{channel}.${property}.message.payload is not valid against the AsyncApi2 schema object`,
    document: produce(document, (draft: any) => {
      draft.channels['users/{userId}/signedUp'][property].message.payload.deprecated = 17;
    }),
    errors: [
      {
        message: '`deprecated` property type must be boolean',
        path: ['channels', 'users/{userId}/signedUp', property, 'message', 'payload', 'deprecated'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  })),
]);
