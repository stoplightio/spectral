import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('info-license', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {},
      info: {
        contact: { name: 'stoplight.io' },
        license: { name: 'MIT' },
      },
    },
    errors: [],
  },
  {
    name: 'info missing license',
    document: {
      swagger: '2.0',
      paths: {},
      info: {
        contact: { name: 'stoplight.io' },
      },
    },
    errors: [
      {
        message: 'OpenAPI object `info` should contain a `license` object.',
        path: ['info'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
