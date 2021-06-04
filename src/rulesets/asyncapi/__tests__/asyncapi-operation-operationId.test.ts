import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from '../../__tests__/__helpers__/tester';

const document = {
  asyncapi: '2.0.0',
  channels: {
    one: {
      publish: {
        operationId: 'onePubId',
      },
      subscribe: {
        operationId: 'oneSubId',
      },
    },
  },
};

testRule('asyncapi-operation-operationId', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  ...['publish', 'subscribe'].map(property => ({
    name: `channels.{channel}.${property}.operationId property is missing`,
    document: produce(document, draft => {
      delete draft.channels.one[property].operationId;
    }),
    errors: [
      {
        message: 'Operation should have an `operationId`.',
        path: ['channels', 'one', property],
        severity: DiagnosticSeverity.Error,
      },
    ],
  })),
]);
