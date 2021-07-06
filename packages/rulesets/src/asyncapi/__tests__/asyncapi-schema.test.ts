import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-schema', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
      channels: {},
    },
    errors: [],
  },

  {
    name: 'channels property is missing',
    document: {
      asyncapi: '2.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
    },
    errors: [
      { message: 'Object must have required property "channels"', path: [], severity: DiagnosticSeverity.Error },
    ],
  },
]);
