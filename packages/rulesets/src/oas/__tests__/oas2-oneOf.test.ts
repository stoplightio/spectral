import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-oneOf', [
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
                  oneOf: [{ type: 'string' }, { type: 'null' }],
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: '"oneOf" keyword must not be used in OpenAPI v2 document.',
        path: ['paths', '/test', 'get', 'responses', '200', 'schema', 'oneOf'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
