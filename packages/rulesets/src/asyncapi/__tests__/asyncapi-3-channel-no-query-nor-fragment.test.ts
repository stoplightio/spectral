import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-channel-no-query-nor-fragment', [
  {
    name: 'valid case',
    document: {
      asyncapi: '3.0.0',
      channels: {
        SomeChannel: { address: 'users/{userId}/signedUp' },
      },
    },
    errors: [],
  },

  {
    name: 'channels.{channel} contains a query delimiter',
    document: {
      asyncapi: '3.0.0',
      channels: {
        SomeChannel: { address: 'users/{userId}/signedUp' },
        SomeChannel1: { address: 'users/{userId}/signedOut?byMistake={didFatFingerTheSignOutButton}' },
      },
    },
    errors: [
      {
        message: 'Channel address must not include query ("?") or fragment ("#") delimiter.',
        path: ['channels', 'SomeChannel1', 'address'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'channels.{channel} contains a fragment delimiter',
    document: {
      asyncapi: '3.0.0',
      channels: {
        SomeChannel: { address: 'users/{userId}/signedUp' },
        SomeChannel1: { address: 'users/{userId}/signedOut#onPurpose' },
      },
    },
    errors: [
      {
        message: 'Channel address must not include query ("?") or fragment ("#") delimiter.',
        path: ['channels', 'SomeChannel1', 'address'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
