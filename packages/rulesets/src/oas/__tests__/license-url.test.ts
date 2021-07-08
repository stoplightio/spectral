import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('license-url', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {},
      info: {
        license: { url: 'stoplight.io' },
      },
    },
    errors: [],
  },

  {
    name: 'info.license is missing url',
    document: {
      swagger: '2.0',
      paths: {},
      info: {
        license: { name: 'MIT' },
      },
    },
    errors: [
      {
        message: 'License object must include "url".',
        path: ['info', 'license'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
