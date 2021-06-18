import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('info-contact', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {},
      info: { version: '1.0', contact: {} },
    },
    errors: [],
  },

  {
    name: 'info is missing contact',
    document: {
      swagger: '2.0',
      paths: {},
      info: { version: '1.0' },
    },
    errors: [
      {
        message: 'Info object should contain `contact` object.',
        path: ['info'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
