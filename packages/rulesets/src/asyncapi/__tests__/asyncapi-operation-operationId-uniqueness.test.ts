import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-operation-operationId-uniqueness', [
  {
    name: 'validate a correct object',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            operationId: 'id1',
          },
        },
        someChannel2: {
          subscribe: {
            operationId: 'id2',
          },
          publish: {
            operationId: 'id3',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'validate a correct object (using traits)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            operationId: 'id1',
          },
        },
        someChannel2: {
          subscribe: {
            operationId: 'id2',
          },
          publish: {
            operationId: 'id1',
            traits: [
              {
                operationId: 'id2',
              },
              {
                operationId: 'id3',
              },
            ],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'return errors on different operations same id',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            operationId: 'id1',
          },
        },
        someChannel2: {
          subscribe: {
            operationId: 'id2',
          },
          publish: {
            operationId: 'id1',
          },
        },
      },
    },
    errors: [
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel2', 'publish', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on same path operations same id',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            operationId: 'id1',
          },
        },
        someChannel2: {
          subscribe: {
            operationId: 'id2',
          },
          publish: {
            operationId: 'id2',
          },
        },
      },
    },
    errors: [
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel2', 'publish', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on different operations (using traits) same id',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            operationId: 'id3',
            traits: [
              {
                operationId: 'id4',
              },
              {
                operationId: 'id1',
              },
            ],
          },
        },
        someChannel2: {
          subscribe: {
            operationId: 'id2',
          },
          publish: {
            operationId: 'id1',
          },
        },
      },
    },
    errors: [
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel2', 'publish', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on same path operations (using traits) same id',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            operationId: 'id1',
          },
        },
        someChannel2: {
          subscribe: {
            operationId: 'id2',
          },
          publish: {
            operationId: 'id3',
            traits: [
              {
                operationId: 'id4',
              },
              {
                operationId: 'id2',
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel2', 'publish', 'traits', '1', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on different operations same id (more than two operations)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            operationId: 'id1',
          },
        },
        someChannel2: {
          subscribe: {
            operationId: 'id2',
          },
          publish: {
            operationId: 'id1',
          },
        },
        someChannel3: {
          subscribe: {
            operationId: 'id1',
          },
          publish: {
            operationId: 'id1',
          },
        },
      },
    },
    errors: [
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel2', 'publish', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel3', 'subscribe', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel3', 'publish', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'return errors on different operations same id (more than two operations and using traits)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel1: {
          subscribe: {
            operationId: 'id1',
          },
        },
        someChannel2: {
          subscribe: {
            operationId: 'id2',
          },
          publish: {
            operationId: 'id3',
            traits: [
              {
                operationId: 'id4',
              },
              {
                operationId: 'id1',
              },
            ],
          },
        },
        someChannel3: {
          subscribe: {
            operationId: 'id1',
            traits: [
              {
                operationId: 'id5',
              },
              {
                operationId: 'id2',
              },
            ],
          },
          publish: {
            operationId: 'id2',
            traits: [
              {
                operationId: 'id1',
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel2', 'publish', 'traits', '1', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel3', 'subscribe', 'traits', '1', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"operationId" must be unique across all the operations.',
        path: ['channels', 'someChannel3', 'publish', 'traits', '0', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'do not check operationId in the components',
    document: {
      asyncapi: '2.3.0',
      channels: {
        someChannel1: {
          subscribe: {
            operationId: 'id1',
          },
        },
        someChannel2: {
          subscribe: {
            operationId: 'id2',
          },
          publish: {
            operationId: 'id3',
          },
        },
      },
      components: {
        channels: {
          someChannel1: {
            subscribe: {
              operationId: 'id1',
            },
          },
          someChannel2: {
            subscribe: {
              operationId: 'id2',
            },
            publish: {
              operationId: 'id1',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
