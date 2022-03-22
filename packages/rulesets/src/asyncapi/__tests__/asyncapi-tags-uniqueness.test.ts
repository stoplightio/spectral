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
        message: 'Tags contains duplicate tag names: one.',
        path: ['tags'],
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
        message: 'Tags contains duplicate tag names: one.',
        path: ['channels', 'someChannel', 'publish', 'tags'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Tags contains duplicate tag names: one.',
        path: ['channels', 'someChannel', 'subscribe', 'tags'],
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
        message: 'Tags contains duplicate tag names: one.',
        path: ['channels', 'someChannel', 'publish', 'traits', '0', 'tags'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Tags contains duplicate tag names: one.',
        path: ['channels', 'someChannel', 'subscribe', 'traits', '0', 'tags'],
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
        message: 'Tags contains duplicate tag names: one.',
        path: ['components', 'messages', 'someMessage', 'tags'],
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
        message: 'Tags contains duplicate tag names: one.',
        path: ['components', 'messages', 'someMessage', 'traits', '0', 'tags'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
