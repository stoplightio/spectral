import { DiagnosticSeverity } from '@stoplight/types';
import { latestVersion } from '../functions/utils/specs';
import testRule from './__helpers__/tester';

testRule('asyncapi-latest-version', [
  {
    name: 'valid case',
    document: {
      asyncapi: latestVersion,
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
        message: `The latest version is not used. You should update to the "${latestVersion}" version.`,
        path: ['asyncapi'],
        severity: DiagnosticSeverity.Information,
      },
    ],
  },
]);
