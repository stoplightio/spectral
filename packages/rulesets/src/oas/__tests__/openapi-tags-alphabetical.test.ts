import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('openapi-tags-alphabetical', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'a-tag' }, { name: 'b-tag' }],
    },
    errors: [],
  },

  {
    name: 'tags is not in alphabetical order',
    document: {
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'b-tag' }, { name: 'a-tag' }],
    },
    errors: [
      {
        message: 'OpenAPI object must have alphabetical "tags".',
        path: ['tags'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
