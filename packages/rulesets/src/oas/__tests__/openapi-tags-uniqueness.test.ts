import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('openapi-tags-uniqueness', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      tags: [{ name: 'one' }, { name: 'two' }],
    },
    errors: [],
  },

  {
    name: 'tags has duplicated names',
    document: {
      swagger: '2.0',
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
    name: 'tags has duplicated more that two times this same name',
    document: {
      swagger: '2.0',
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
