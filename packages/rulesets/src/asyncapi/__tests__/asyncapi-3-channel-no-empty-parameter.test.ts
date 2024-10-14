import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-channel-no-empty-parameter', [
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
    name: 'channels.{channel} contains empty parameter substitution pattern',
    document: {
      asyncapi: '3.0.0',
      channels: {
        SomeChannel: { address: 'users/{userId}/signedUp' },
        SomeChannel1: { address: 'users/{}/signedOut' },
      },
    },
    errors: [
      {
        message: 'Channel address must not have empty parameter substitution pattern.',
        path: ['channels', 'SomeChannel1', 'address'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
