import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-message-messageId-uniqueness', [
  {
    name: 'validate a correct object',
    document: {
      asyncapi: '2.4.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              messageId: 'id3',
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'validate a correct object (oneOf case)',
    document: {
      asyncapi: '2.4.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              oneOf: [
                {
                  messageId: 'id2',
                },
                {
                  messageId: 'id3',
                },
              ],
            },
          },
          publish: {
            message: {
              messageId: 'id4',
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'validate a correct object (using traits)',
    document: {
      asyncapi: '2.4.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              messageId: 'id1',
              traits: [
                {
                  messageId: 'id2',
                },
                {
                  messageId: 'id3',
                },
              ],
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'validate a correct object (oneOf case using traits)',
    document: {
      asyncapi: '2.4.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              oneOf: [
                {
                  messageId: 'id1',
                  traits: [
                    {
                      messageId: 'id3',
                    },
                    {
                      messageId: 'id2',
                    },
                  ],
                },
                {
                  messageId: 'id3',
                },
              ],
            },
          },
          publish: {
            message: {
              messageId: 'id4',
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'return errors on different messages same id',
    document: {
      asyncapi: '2.4.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              messageId: 'id1',
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel2', 'publish', 'message', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on same path messages same id',
    document: {
      asyncapi: '2.4.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              messageId: 'id2',
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel2', 'publish', 'message', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on different messages (using traits) same id',
    document: {
      asyncapi: '2.4.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id3',
              traits: [
                {
                  messageId: 'id4',
                },
                {
                  messageId: 'id1',
                },
              ],
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              messageId: 'id1',
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel2', 'publish', 'message', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on same path messages (using traits) same id',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              messageId: 'id3',
              traits: [
                {
                  messageId: 'id4',
                },
                {
                  messageId: 'id2',
                },
              ],
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel2', 'publish', 'message', 'traits', '1', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on different messages (oneOf case using traits) same id',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              oneOf: [
                {
                  messageId: 'id3',
                  traits: [
                    {
                      messageId: 'id4',
                    },
                    {
                      messageId: 'id2',
                    },
                  ],
                },
                {
                  messageId: 'id3',
                  traits: [
                    {
                      messageId: 'id1',
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
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel2', 'publish', 'message', 'oneOf', '0', 'traits', '1', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel2', 'publish', 'message', 'oneOf', '1', 'traits', '0', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on different messages same id (more than two messages)',
    document: {
      asyncapi: '2.4.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel3: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
          publish: {
            message: {
              messageId: 'id1',
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel2', 'publish', 'message', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel3', 'subscribe', 'message', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel3', 'publish', 'message', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on different messages same id (more than two messages and using traits)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              messageId: 'id3',
              traits: [
                {
                  messageId: 'id4',
                },
                {
                  messageId: 'id1',
                },
              ],
            },
          },
        },
        someChannel3: {
          subscribe: {
            message: {
              messageId: 'id1',
              traits: [
                {
                  messageId: 'id5',
                },
                {
                  messageId: 'id2',
                },
              ],
            },
          },
          publish: {
            message: {
              messageId: 'id2',
              traits: [
                {
                  messageId: 'id1',
                },
              ],
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel2', 'publish', 'message', 'traits', '1', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel3', 'subscribe', 'message', 'traits', '1', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"messageId" must be unique across all the messages.',
        path: ['channels', 'someChannel3', 'publish', 'message', 'traits', '0', 'messageId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'do not check messageId in the components',
    document: {
      asyncapi: '2.4.0',
      channels: {
        someChannel1: {
          subscribe: {
            message: {
              messageId: 'id1',
            },
          },
        },
        someChannel2: {
          subscribe: {
            message: {
              messageId: 'id2',
            },
          },
          publish: {
            message: {
              messageId: 'id3',
            },
          },
        },
      },
      components: {
        channels: {
          someChannel1: {
            subscribe: {
              message: {
                messageId: 'id1',
              },
            },
          },
          someChannel2: {
            subscribe: {
              message: {
                messageId: 'id2',
              },
            },
            publish: {
              message: {
                messageId: 'id1',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
