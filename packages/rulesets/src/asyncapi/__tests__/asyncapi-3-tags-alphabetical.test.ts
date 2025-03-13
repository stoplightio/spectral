import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-tags-alphabetical', [
  {
    name: 'valid case',
    document: {
      asyncapi: '3.0.0',
      info: {
        tags: [{ name: 'a tag' }, { name: 'another tag' }],
      },
    },
    errors: [],
  },

  {
    name: 'tags are not sorted',
    document: {
      asyncapi: '3.0.0',
      info: {
        tags: [{ name: 'wrongly ordered' }, { name: 'a tag' }, { name: 'another tag' }],
      },
    },
    errors: [
      {
        message: 'AsyncAPI object must have alphabetical "tags".',
        path: ['info', 'tags'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
