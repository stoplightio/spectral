import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-tags-uniqueness', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      tags: [{ name: 'one' }, { name: 'two' }],
    },
    errors: [],
  },

  {
    name: 'tags has duplicated names (root)',
    document: {
      asyncapi: '2.0.0',
      tags: [{ name: 'one' }, { name: 'one' }],
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'tags has duplicated names (server)',
    document: {
      asyncapi: '2.5.0',
      servers: {
        someServer: {
          tags: [{ name: 'one' }, { name: 'one' }],
        },
        anotherServer: {
          tags: [{ name: 'one' }, { name: 'two' }],
        },
      },
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['servers', 'someServer', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'tags has duplicated names (operation)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            tags: [{ name: 'one' }, { name: 'one' }],
          },
          subscribe: {
            tags: [{ name: 'one' }, { name: 'one' }],
          },
        },
      },
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['channels', 'someChannel', 'publish', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['channels', 'someChannel', 'subscribe', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'tags has duplicated names (operation trait)',
    document: {
      asyncapi: '2.0.0',
      channels: {
        someChannel: {
          publish: {
            traits: [
              {
                tags: [{ name: 'one' }, { name: 'one' }],
              },
            ],
          },
          subscribe: {
            traits: [
              {
                tags: [{ name: 'one' }, { name: 'one' }],
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['channels', 'someChannel', 'publish', 'traits', '0', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['channels', 'someChannel', 'subscribe', 'traits', '0', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'tags has duplicated names (message)',
    document: {
      asyncapi: '2.0.0',
      components: {
        messages: {
          someMessage: {
            tags: [{ name: 'one' }, { name: 'one' }],
          },
        },
      },
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['components', 'messages', 'someMessage', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'tags has duplicated names (message trait)',
    document: {
      asyncapi: '2.0.0',
      components: {
        messages: {
          someMessage: {
            traits: [
              {
                tags: [{ name: 'one' }, { name: 'one' }],
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['components', 'messages', 'someMessage', 'traits', '0', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'tags has duplicated more that two times this same name',
    document: {
      asyncapi: '2.0.0',
      tags: [{ name: 'one' }, { name: 'one' }, { name: 'two' }, { name: 'one' }],
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['tags', '3', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
