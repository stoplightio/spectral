import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/runner';

testRule('asyncapi-info-contact', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
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
    name: 'contact property is missing',
    document: {
      asyncapi: '2.0.0',
      info: {},
    },
    errors: [
      {
        message: 'Info object should contain `contact` object.',
        path: ['info'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
