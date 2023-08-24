import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('operation-tag-defined', [
  {
    name: 'validate a correct object',
    document: {
      openapi: '3.0.0',
      tags: [
        {
          name: 'tag1',
        },
        {
          name: 'tag2',
        },
      ],
      paths: {
        '/path1': {
          get: {
            tags: ['tag1'],
          },
        },
        '/path2': {
          get: {
            tags: ['tag2'],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'return errors on undefined tag',
    document: {
      openapi: '3.0.0',
      tags: [
        {
          name: 'tag1',
        },
      ],
      paths: {
        '/path1': {
          get: {
            tags: ['tag2'],
          },
        },
      },
    },

    errors: [
      {
        message: 'Operation tags must be defined in global tags.',
        path: ['paths', '/path1', 'get', 'tags', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'return errors on undefined tags among defined tags',
    document: {
      openapi: '3.0.0',
      tags: [
        {
          name: 'tag1',
        },
        {
          name: 'tag3',
        },
      ],
      paths: {
        '/path1': {
          get: {
            tags: ['tag1', 'tag2', 'tag3', 'tag4'],
          },
        },
      },
    },

    errors: [
      {
        message: 'Operation tags must be defined in global tags.',
        path: ['paths', '/path1', 'get', 'tags', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Operation tags must be defined in global tags.',
        path: ['paths', '/path1', 'get', 'tags', '3'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'resilient to no global tags or operation tags',
    document: {
      openapi: '3.0.0',
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
        },
        '/path2': {
          get: {
            operationId: 'id2',
          },
        },
      },
    },
    errors: [],
  },
]);
