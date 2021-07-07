import { cloneDeep } from 'lodash';
import produce from 'immer';
import { DiagnosticSeverity } from '@stoplight/types';

import testRule from './__helpers__/tester';

const headersBearer = {
  headers: {
    type: 'object',
    properties: {
      'some-header': {
        type: 'string',
      },
    },
  },
};

const document = {
  asyncapi: '2.0.0',
  channels: {
    'users/{userId}/signedUp': {
      publish: {
        message: cloneDeep(headersBearer),
      },
      subscribe: {
        message: cloneDeep(headersBearer),
      },
    },
  },
  components: {
    messageTraits: {
      aTrait: cloneDeep(headersBearer),
    },
    messages: {
      aMessage: cloneDeep(headersBearer),
    },
  },
};

testRule('asyncapi-headers-schema-type-object', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  {
    name: 'components.messages.{message}.headers is not of type "object"',
    document: produce(document, draft => {
      draft.components.messages.aMessage.headers.type = 'integer';
    }),
    errors: [
      {
        message:
          'Headers schema type must be "object" (`type` property must be equal to one of the allowed values: `object`. Did you mean `object`?).',
        path: ['components', 'messages', 'aMessage', 'headers', 'type'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'components.messages.{message}.headers lacks "type" property',
    document: produce(document, (draft: any) => {
      draft.components.messages.aMessage.headers = { const: 'Hello World!' };
    }),
    errors: [
      {
        message: 'Headers schema type must be "object" (`headers` property must have required property `type`).',
        path: ['components', 'messages', 'aMessage', 'headers'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'components.messageTraits.{trait}.headers is not of type "object"',
    document: produce(document, (draft: any) => {
      draft.components.messageTraits.aTrait.headers = { type: 'integer' };
    }),
    errors: [
      {
        message:
          'Headers schema type must be "object" (`type` property must be equal to one of the allowed values: `object`. Did you mean `object`?).',
        path: ['components', 'messageTraits', 'aTrait', 'headers', 'type'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'components.messageTraits.{trait}.headers lacks "type" property',
    document: produce(document, (draft: any) => {
      draft.components.messageTraits.aTrait.headers = { const: 'Hello World!' };
    }),
    errors: [
      {
        message: 'Headers schema type must be "object" (`headers` property must have required property `type`).',
        path: ['components', 'messageTraits', 'aTrait', 'headers'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  ...['publish', 'subscribe'].flatMap(property => [
    {
      name: `channels.{channel}.${property}.message.headers lacks "type" property`,
      document: produce(document, draft => {
        draft.channels['users/{userId}/signedUp'][property].message.headers = { const: 'Hello World!' };
      }),
      errors: [
        {
          message: 'Headers schema type must be "object" (`headers` property must have required property `type`).',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'headers'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },

    {
      name: `channels.{channel}.${property}.message.headers is not of type "object"`,
      document: produce(document, draft => {
        draft.channels['users/{userId}/signedUp'][property].message.headers = { type: 'integer' };
      }),
      errors: [
        {
          message:
            'Headers schema type must be "object" (`type` property must be equal to one of the allowed values: `object`. Did you mean `object`?).',
          path: ['channels', 'users/{userId}/signedUp', property, 'message', 'headers', 'type'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },
  ]),
]);
