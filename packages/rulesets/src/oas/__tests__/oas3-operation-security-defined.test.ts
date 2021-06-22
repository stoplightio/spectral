import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('oas3-operation-security-defined', [
  {
    name: 'validate a correct object (just in body)',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {},
        },
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
    name: 'return errors on invalid object',
    document: {
      openapi: '3.0.2',
      components: {},
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
        message: 'Operation `security` values must match a scheme defined in the `components.securitySchemes` object.',
        path: ['paths', '/path', 'get', 'security', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
