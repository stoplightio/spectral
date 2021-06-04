import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('asyncapi-channel-no-query-nor-fragment', [
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
    name: 'channels.{channel} contains a query delimiter',
    document: {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {},
        'users/{userId}/signedOut?byMistake={didFatFingerTheSignOutButton}': {},
      },
    },
    errors: [
      {
        message: 'Channel path should not include a query (`?`) or a fragment (`#`) delimiter.',
        path: ['channels', 'users/{userId}/signedOut?byMistake={didFatFingerTheSignOutButton}'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'channels.{channel} contains a fragment delimiter',
    document: {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {},
        'users/{userId}/signedOut#onPurpose': {},
      },
    },
    errors: [
      {
        message: 'Channel path should not include a query (`?`) or a fragment (`#`) delimiter.',
        path: ['channels', 'users/{userId}/signedOut#onPurpose'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
