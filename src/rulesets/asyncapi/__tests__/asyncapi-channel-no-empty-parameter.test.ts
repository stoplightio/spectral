import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('asyncapi-channel-no-empty-parameter', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {},
      },
    },
    errors: [],
  },

  {
    name: 'channels.{channel} contains empty parameter substitution pattern',
    document: {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {},
        'users/{}/signedOut': {},
      },
    },
    errors: [
      {
        message: 'Channel path should not have empty parameter substitution pattern.',
        path: ['channels', 'users/{}/signedOut'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
