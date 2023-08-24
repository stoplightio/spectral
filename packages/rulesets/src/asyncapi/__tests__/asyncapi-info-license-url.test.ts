import testRule from './__helpers__/tester';
import { DiagnosticSeverity } from '@stoplight/types/';

testRule('asyncapi-info-license-url', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      info: {
        license: {
          url: 'https://github.com/stoplightio/spectral/blob/develop/LICENSE',
        },
      },
    },
    errors: [],
  },

  {
    name: 'url property is missing',
    document: {
      asyncapi: '2.0.0',
      info: {
        license: {},
      },
    },
    errors: [
      {
        message: 'License object must include "url".',
        path: ['info', 'license'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
