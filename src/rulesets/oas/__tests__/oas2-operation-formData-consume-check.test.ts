import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('oas2-operation-formData-consume-check', [
  {
    name: 'validate a correct object',
    document: {
      swagger: '2.0',
      paths: {
        '/path1': {
          get: {
            consumes: ['application/x-www-form-urlencoded', 'application/xml'],
            parameters: [{ in: 'formData', name: 'test' }],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'return errors on different path operations same id',
    document: {
      swagger: '2.0',
      paths: {
        '/path1': {
          get: {
            consumes: ['application/xml'],
            parameters: [{ in: 'formData', name: 'test' }],
          },
        },
      },
    },
    errors: [
      {
        message:
          'Operations with an `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in their `consumes` property.',
        path: ['paths', '/path1', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
