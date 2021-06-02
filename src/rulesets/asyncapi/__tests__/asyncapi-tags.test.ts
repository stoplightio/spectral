import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/runner';

testRule('asyncapi-tags', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      tags: [{ name: 'one' }, { name: 'another' }],
    },
    errors: [],
  },

  {
    name: 'tags property is missing',
    document: {
      asyncapi: '2.0.0',
    },
    errors: [
      {
        message: 'AsyncAPI object should have non-empty `tags` array.',
        path: [],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
