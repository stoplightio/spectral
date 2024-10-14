import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from './__helpers__/tester';

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
const document_v3 = {
  asyncapi: '3.0.0',
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
  {
    name: 'valid v3 case',
    document: document_v3,
    errors: [],
  },
  ...['name', 'url', 'email'].map(property => ({
    name: `for v3 contact.${property} property is missing`,
    document: produce(document_v3, draft => {
      delete draft.info.contact[property];
    }),
    errors: [
      {
        message: 'Contact object must have "name", "url" and "email".',
        path: ['info', 'contact'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  })),
  ...['name', 'url', 'email'].map(property => ({
    name: `contact.${property} property is missing`,
    document: produce(document, draft => {
      delete draft.info.contact[property];
    }),
    errors: [
      {
        message: 'Contact object must have "name", "url" and "email".',
        path: ['info', 'contact'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  })),
]);
