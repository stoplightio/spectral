import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-info-license', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      info: {
        license: {
          name: 'MIT',
        },
      },
    },
    errors: [],
  },

  {
    name: 'license property is missing',
    document: {
      asyncapi: '2.0.0',
      info: {},
    },
    errors: [
      {
        message: 'AsyncAPI object should contain `license` object.',
        path: ['info'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
