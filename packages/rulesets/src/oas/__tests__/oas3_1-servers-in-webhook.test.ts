import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3_1-servers-in-webhook', [
  {
    name: 'servers defined in webhook',
    document: {
      openapi: '3.1.0',
      webhooks: {
        servers: [],
        newPet: {
          post: {
            servers: [],
          },
        },
      },
    },
    errors: [
      {
        message: 'Servers should not be defined in a webhook.',
        path: ['webhooks', 'servers'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Servers should not be defined in a webhook.',
        path: ['webhooks', 'newPet', 'post', 'servers'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
