import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-channel-parameters', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {
          parameters: {
            userId: {},
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'channel has not defined definition for one of the parameters',
    document: {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/{anotherParam}/signedUp': {
          parameters: {
            userId: {},
          },
        },
      },
    },
    errors: [
      {
        message: 'Not all channel\'s parameters are described with "parameters" object. Missed: anotherParam.',
        path: ['channels', 'users/{userId}/{anotherParam}/signedUp', 'parameters'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'channel has not defined definition for two+ of the parameters',
    document: {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/{anotherParam1}/{anotherParam2}/signedUp': {
          parameters: {
            userId: {},
          },
        },
      },
    },
    errors: [
      {
        message:
          'Not all channel\'s parameters are described with "parameters" object. Missed: anotherParam1, anotherParam2.',
        path: ['channels', 'users/{userId}/{anotherParam1}/{anotherParam2}/signedUp', 'parameters'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'channel has not defined definition for one of the parameters (in the components.channels)',
    document: {
      asyncapi: '2.3.0',
      components: {
        channels: {
          'users/{userId}/{anotherParam}/signedUp': {
            parameters: {
              userId: {},
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Not all channel\'s parameters are described with "parameters" object. Missed: anotherParam.',
        path: ['components', 'channels', 'users/{userId}/{anotherParam}/signedUp', 'parameters'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'channel has redundant paramaters',
    document: {
      asyncapi: '2.0.0',
      channels: {
        'users/{userId}/signedUp': {
          parameters: {
            userId: {},
            anotherParam1: {},
            anotherParam2: {},
          },
        },
      },
    },
    errors: [
      {
        message: 'Channel\'s "parameters" object has redundant defined "anotherParam1" parameter.',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'anotherParam1'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Channel\'s "parameters" object has redundant defined "anotherParam2" parameter.',
        path: ['channels', 'users/{userId}/signedUp', 'parameters', 'anotherParam2'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'channel has redundant paramaters (in the components.channels)',
    document: {
      asyncapi: '2.3.0',
      components: {
        channels: {
          'users/{userId}/signedUp': {
            parameters: {
              userId: {},
              anotherParam1: {},
              anotherParam2: {},
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Channel\'s "parameters" object has redundant defined "anotherParam1" parameter.',
        path: ['components', 'channels', 'users/{userId}/signedUp', 'parameters', 'anotherParam1'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Channel\'s "parameters" object has redundant defined "anotherParam2" parameter.',
        path: ['components', 'channels', 'users/{userId}/signedUp', 'parameters', 'anotherParam2'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
