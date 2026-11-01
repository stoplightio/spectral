import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-latest-version', [
  {
    name: 'valid case',
    document: {
      asyncapi: '3.1.0',
    },
    errors: [],
  },

  {
    name: 'invalid case',
    document: {
      asyncapi: '2.0.0',
    },
    errors: [
      {
        message: 'The latest version is not used. You should update to the "3.1.0" version.',
        path: ['asyncapi'],
        severity: DiagnosticSeverity.Information,
      },
    ],
  },
]);
