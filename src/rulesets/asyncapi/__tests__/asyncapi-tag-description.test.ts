import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-tag-description', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      tags: [
        {
          name: 'a tag',
          description: "I'm a tag.",
        },
      ],
    },
    errors: [],
  },

  {
    name: 'description property is missing',
    document: {
      asyncapi: '2.0.0',
      tags: [
        {
          name: 'a tag',
        },
      ],
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
