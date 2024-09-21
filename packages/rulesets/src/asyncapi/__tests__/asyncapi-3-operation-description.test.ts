import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-operation-description', [
  {
    name: 'valid case',
    document: {
      asyncapi: '3.0.0',
      operations: {
        SomeOperation: {
          description: 'I do this.',
        },
      },
    },
    errors: [],
  },
  {
    name: `operations.SomeOperation.description property is missing`,
    document: {
      asyncapi: '3.0.0',
      operations: {
        SomeOperation: {},
      },
    },
    errors: [
      {
        message: 'Operation "description" must be present and non-empty string.',
        path: ['operations', 'SomeOperation'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
