import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from '../../__tests__/__helpers__/tester';

const document = {
  asyncapi: '2.0.0',
  channels: {
    one: {
      publish: {
        description: 'I do this.',
      },
      subscribe: {
        description: '...and that',
      },
    },
  },
};

testRule('asyncapi-operation-description', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  ...['publish', 'subscribe'].map(property => ({
    name: `channels.{channel}.${property}.description property is missing`,
    document: produce(document, draft => {
      delete draft.channels.one[property].description;
    }),
    errors: [
      {
        message: 'Operation `description` must be present and non-empty string.',
        path: ['channels', 'one', property],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  })),
]);
