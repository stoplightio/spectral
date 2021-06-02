import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-tags-alphabetical', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      tags: [{ name: 'a tag' }, { name: 'another tag' }],
    },
    errors: [],
  },

  {
    name: 'tags are not sorted',
    document: {
      asyncapi: '2.0.0',
      tags: [{ name: 'wrongly ordered' }, { name: 'a tag' }, { name: 'another tag' }],
    },
    errors: [
      {
        message: 'AsyncAPI object should have alphabetical `tags`.',
        path: ['tags'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
