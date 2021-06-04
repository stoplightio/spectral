import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-anyOf', [
  {
    name: 'annotates with correct paths',
    document: {
      swagger: '2.0',
      schemes: ['http'],
      info: {
        title: 'Test',
        version: '1.0.0',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              200: {
                description: 'A paged array of pets',
                schema: {
                  anyOf: [{ type: 'string' }, { type: null }],
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'anyOf is not available in OpenAPI v2, it was added in OpenAPI v3',
        path: ['paths', '/test', 'get', 'responses', '200', 'schema', 'anyOf'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
