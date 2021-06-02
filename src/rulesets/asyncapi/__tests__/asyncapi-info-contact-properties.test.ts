import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from './__helpers__/runner';

const document = {
  asyncapi: '2.0.0',
  info: {
    contact: {
      name: 'stoplight',
      url: 'stoplight.io',
      email: 'support@stoplight.io',
    },
  },
};

testRule('asyncapi-info-contact-properties', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  ...['name', 'url', 'email'].map(property => ({
    name: `contact.${property} property is missing`,
    document: produce(document, draft => {
      delete draft.info.contact[property];
    }),
    errors: [
      {
        message: 'Contact object should have `name`, `url` and `email`.',
        path: ['info', 'contact'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  })),
]);
