import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-tags-uniqueness', [
  {
    name: 'valid case',
    document: {
      asyncapi: '3.0.0',
      info: {
        tags: [{ name: 'one' }, { name: 'two' }],
      },
    },
    errors: [],
  },

  {
    name: 'tags has duplicated names (root)',
    document: {
      asyncapi: '3.0.0',
      info: {
        tags: [{ name: 'one' }, { name: 'one' }],
      },
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['info', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'tags has duplicated names (server)',
    document: {
      asyncapi: '3.0.0',
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
      asyncapi: '3.0.0',
      operations: {
        SomeOperation: {
          tags: [{ name: 'one' }, { name: 'one' }],
        },
      },
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['operations', 'SomeOperation', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'tags has duplicated names (operation trait)',
    document: {
      asyncapi: '3.0.0',
      operations: {
        SomeOperation: {
          traits: [
            {
              tags: [{ name: 'one' }, { name: 'one' }],
            },
          ],
        },
      },
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['operations', 'SomeOperation', 'traits', '0', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'tags has duplicated names (message)',
    document: {
      asyncapi: '3.0.0',
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
      asyncapi: '3.0.0',
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
      asyncapi: '3.0.0',
      info: {
        tags: [{ name: 'one' }, { name: 'one' }, { name: 'two' }, { name: 'one' }],
      },
    },
    errors: [
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['info', 'tags', '1', 'name'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '"tags" object contains duplicate tag name "one".',
        path: ['info', 'tags', '3', 'name'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
