import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-callbacks-in-callbacks', [
  {
    name: 'callbacks defined within a callback',
    document: {
      openapi: '3.0.0',
      paths: {
        '/path': {
          get: {
            callbacks: {
              onData: {
                '/data': {
                  post: {
                    callbacks: {},
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
        message: 'Callbacks should not be defined within a callback',
        path: ['paths', '/path', 'get', 'callbacks', 'onData', '/data', 'post', 'callbacks'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
