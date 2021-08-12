import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('contact-properties', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {},
      info: {
        contact: {
          name: 'stoplight',
          url: 'stoplight.io',
          email: 'support@stoplight.io',
        },
      },
    },
    errors: [],
  },

  {
    name: 'name, url, email are missing',
    document: {
      swagger: '2.0',
      paths: {},
      info: { contact: {} },
    },
    errors: [
      {
        message: 'Contact object must have "name", "url" and "email".',
        path: ['info', 'contact'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
