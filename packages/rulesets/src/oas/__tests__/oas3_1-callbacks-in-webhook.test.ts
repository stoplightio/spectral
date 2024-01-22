import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3_1-servers-in-webhook', [
  {
    name: 'callbacks defined in webhook',
    document: {
      openapi: '3.1.0',
      webhooks: {
        newPet: {
          post: {
            callbacks: {},
          },
        },
      },
    },
    errors: [
      {
        message: 'Callbacks should not be defined in a webhook.',
        path: ['webhooks', 'newPet', 'post', 'callbacks'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
