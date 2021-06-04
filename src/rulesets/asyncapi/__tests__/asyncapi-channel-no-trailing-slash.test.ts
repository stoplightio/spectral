import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('asyncapi-channel-no-trailing-slash', [
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
    name: 'channels.{channel} ends with a trailing slash',
    document: {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {},
        'users/{userId}/signedOut/': {},
      },
    },
    errors: [
      {
        message: 'Channel path should not end with a slash.',
        path: ['channels', 'users/{userId}/signedOut/'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
