import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-message-examples', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            message: {
              payload: {
                type: 'string',
              },
              headers: {
                type: 'object',
              },
              examples: [
                {
                  payload: 'foobar',
                  headers: {
                    someKey: 'someValue',
                  },
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
    name: 'valid case (with omitted payload)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            message: {
              headers: {
                type: 'object',
              },
              examples: [
                {
                  payload: 'foobar',
                  headers: {
                    someKey: 'someValue',
                  },
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
    name: 'valid case (with omitted headers)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            message: {
              payload: {
                type: 'string',
              },
              examples: [
                {
                  payload: 'foobar',
                  headers: {
                    someKey: 'someValue',
                  },
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
    name: 'valid case (with omitted paylaod and headers)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            message: {
              examples: [
                {
                  payload: 'foobar',
                  headers: {
                    someKey: 'someValue',
                  },
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
    name: 'valid case (with traits)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            message: {
              payload: {
                type: 'string',
              },
              headers: {
                type: 'object',
              },
              examples: [
                {
                  payload: 2137,
                  headers: {
                    someKey: 'someValue',
                  },
                },
              ],
              traits: [
                {
                  payload: {
                    type: 'number',
                  },
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
    name: 'invalid case',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            message: {
              payload: {
                type: 'string',
              },
              headers: {
                type: 'object',
              },
              examples: [
                {
                  payload: 2137,
                  headers: {
                    someKey: 'someValue',
                  },
                },
              ],
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"payload" property type must be string',
        path: ['channels', 'someChannel', 'publish', 'message', 'examples', '0', 'payload'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (oneOf case)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            message: {
              oneOf: [
                {
                  payload: {
                    type: 'string',
                  },
                  headers: {
                    type: 'object',
                  },
                  examples: [
                    {
                      payload: 2137,
                      headers: {
                        someKey: 'someValue',
                      },
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
        message: '"payload" property type must be string',
        path: ['channels', 'someChannel', 'publish', 'message', 'oneOf', '0', 'examples', '0', 'payload'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (inside components.messages)',
    document: {
      asyncapi: '2.0.0',
      components: {
        messages: {
          someMessage: {
            payload: {
              type: 'string',
            },
            headers: {
              type: 'object',
            },
            examples: [
              {
                payload: 2137,
                headers: {
                  someKey: 'someValue',
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: '"payload" property type must be string',
        path: ['components', 'messages', 'someMessage', 'examples', '0', 'payload'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (with multiple errors)',
    document: {
      asyncapi: '2.0.0',
      components: {
        messages: {
          someMessage: {
            payload: {
              type: 'object',
              required: ['key1', 'key2'],
              properties: {
                key1: {
                  type: 'string',
                },
                key2: {
                  type: 'string',
                },
              },
            },
            headers: {
              type: 'object',
            },
            examples: [
              {
                payload: {
                  key1: 2137,
                },
                headers: 'someValue',
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: '"payload" property must have required property "key2"',
        path: ['components', 'messages', 'someMessage', 'examples', '0', 'payload'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"key1" property type must be string',
        path: ['components', 'messages', 'someMessage', 'examples', '0', 'payload', 'key1'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"headers" property type must be object',
        path: ['components', 'messages', 'someMessage', 'examples', '0', 'headers'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (with traits)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            message: {
              payload: {
                type: 'number',
              },
              headers: {
                type: 'object',
              },
              examples: [
                {
                  payload: 2137,
                  headers: {
                    someKey: 'someValue',
                  },
                },
              ],
              traits: [
                {
                  payload: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"payload" property type must be string',
        path: ['channels', 'someChannel', 'publish', 'message', 'examples', '0', 'payload'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
