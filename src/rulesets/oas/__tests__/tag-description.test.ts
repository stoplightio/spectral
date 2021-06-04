import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('tag-description', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'tag', description: 'some-description' }],
    },
    errors: [],
  },

  {
    name: 'tag has no description',
    document: {
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'tag' }],
    },
    errors: [
      {
        message: 'Tag object should have a `description`.',
        path: ['tags', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
