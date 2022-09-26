import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-message-messageId', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.4.0',
      channels: {
        one: {
          publish: {
            message: {
              messageId: 'firstId',
            },
          },
          subscribe: {
            message: {
              messageId: 'secondId',
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid case (unsupported version)',
    document: {
      asyncapi: '2.3.0',
      channels: {
        one: {
          publish: {
            message: {},
          },
          subscribe: {
            message: {},
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid case (with traits)',
    document: {
      asyncapi: '2.4.0',
      channels: {
        one: {
          publish: {
            message: {
              traits: [
                {},
                {
                  messageId: 'firstId',
                },
              ],
            },
          },
          subscribe: {
            message: {
              messageId: 'secondId',
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'invalid case',
    document: {
      asyncapi: '2.4.0',
      channels: {
        one: {
          publish: {
            message: {},
          },
          subscribe: {
            message: {},
          },
        },
      },
    },
    errors: [
      {
        message: 'Message should have a "messageId" field defined.',
        path: ['channels', 'one', 'publish', 'message'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Message should have a "messageId" field defined.',
        path: ['channels', 'one', 'subscribe', 'message'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'invalid case (oneOf case)',
    document: {
      asyncapi: '2.4.0',
      channels: {
        one: {
          publish: {
            message: {},
            externalDocs: {},
          },
          subscribe: {
            message: {
              oneOf: [
                {},
                {
                  messageId: 'someId',
                },
                {},
                {
                  traits: [
                    {},
                    {
                      messageId: 'anotherId',
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Message should have a "messageId" field defined.',
        path: ['channels', 'one', 'publish', 'message'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Message should have a "messageId" field defined.',
        path: ['channels', 'one', 'subscribe', 'message', 'oneOf', '0'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Message should have a "messageId" field defined.',
        path: ['channels', 'one', 'subscribe', 'message', 'oneOf', '2'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'invalid case (with traits)',
    document: {
      asyncapi: '2.4.0',
      channels: {
        one: {
          publish: {
            message: {
              traits: [{}, {}],
            },
          },
          subscribe: {
            message: {
              messageId: 'secondId',
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Message should have a "messageId" field defined.',
        path: ['channels', 'one', 'publish', 'message'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
