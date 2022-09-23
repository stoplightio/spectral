import { DiagnosticSeverity } from '@stoplight/types';
import { latestAsyncApiVersion } from '../functions/asyncApi2DocumentSchema';
import testRule from './__helpers__/tester';

testRule('asyncapi-latest-version', [
  {
    name: 'valid case',
    document: {
      asyncapi: latestAsyncApiVersion,
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
        message: `The latest version is not used. You should update to the "${latestAsyncApiVersion}" version.`,
        path: ['asyncapi'],
        severity: DiagnosticSeverity.Information,
      },
    ],
  },
]);
