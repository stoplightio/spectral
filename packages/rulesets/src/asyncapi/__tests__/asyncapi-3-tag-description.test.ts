import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-tag-description', [
  {
    name: 'valid case',
    document: {
      asyncapi: '3.0.0',
      info: {
        tags: [
          {
            name: 'a tag',
            description: "I'm a tag.",
          },
        ],
      },
    },
    errors: [],
  },

  {
    name: 'description property is missing',
    document: {
      asyncapi: '3.0.0',
      info: {
        tags: [
          {
            name: 'a tag',
          },
        ],
      },
    },
    errors: [
      {
        message: 'Tag object must have "description".',
        path: ['info', 'tags', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
