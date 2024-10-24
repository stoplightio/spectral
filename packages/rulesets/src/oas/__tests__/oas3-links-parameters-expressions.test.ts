import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-links-parameters-expression', [
  {
    name: 'all link objects are validated and correct error object produced',
    document: {
      openapi: '3.0.3',
      info: {
        title: 'response example',
        version: '1.0',
      },
      paths: {
        '/user': {
          get: {
            responses: {
              200: {
                description: 'dummy description',
                links: {
                  link1: {
                    parameters: '$invalidkeyword',
                  },
                  link2: {
                    parameters: '$invalidkeyword',
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Expressions must start with one of: `$url`, `$method`, `$statusCode`, `$request.`,`$response.`',
        path: ['paths', '/user', 'get', 'responses', '200', 'links', 'link1', 'parameters'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Expressions must start with one of: `$url`, `$method`, `$statusCode`, `$request.`,`$response.`',
        path: ['paths', '/user', 'get', 'responses', '200', 'links', 'link2', 'parameters'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
