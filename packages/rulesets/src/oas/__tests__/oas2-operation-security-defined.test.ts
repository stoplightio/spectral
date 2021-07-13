import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('oas2-operation-security-defined', [
  {
    name: 'a correct object (just in body)',
    document: {
      securityDefinitions: {
        apikey: {},
      },
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
              },
            ],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'invalid object',
    document: {
      swagger: '2.0',
      securityDefinitions: {},
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Operation "security" values must match a scheme defined in the "securityDefinitions" object.',
        path: ['paths', '/path', 'get', 'security', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
