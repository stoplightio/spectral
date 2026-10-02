import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-tags', [
  {
    name: 'valid case',
    document: {
      asyncapi: '3.0.0',
      info: {
        tags: [{ name: 'one' }, { name: 'another' }],
      },
    },
    errors: [],
  },
  {
    name: 'info tags property is missing',
    document: {
      asyncapi: '3.0.0',
      info: {},
    },
    errors: [
      {
        message: 'AsyncAPI document must have non-empty "tags" array.',
        path: ['info'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'info tags property is missing in AsyncAPI 3.1',
    document: {
      asyncapi: '3.1.0',
      info: {},
    },
    errors: [
      {
        message: 'AsyncAPI document must have non-empty "tags" array.',
        path: ['info'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
