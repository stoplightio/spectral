import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-schema', [
  {
    name: 'annotates with correct paths',
    document: {
      swagger: '2.0',
      paths: {
        '/test': {
          get: {},
        },
      },
      schemes: ['http'],
      info: {
        title: 'Test',
        version: '1.0.0',
      },
    },
    errors: [
      {
        message: `"get" property must have required property "responses".`,
        path: ['paths', '/test', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'validate security definitions',
    document: {
      swagger: '2.0',
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
              },
            },
          },
        },
      },
      securityDefinitions: {
        basic: null,
      },
    },
    errors: [
      {
        message: 'Invalid basic authentication security definition.',
        path: ['securityDefinitions', 'basic'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
