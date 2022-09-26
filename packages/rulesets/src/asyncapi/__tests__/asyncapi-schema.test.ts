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
    name: 'invalid case (channels property is missing)',
    document: {
      asyncapi: '2.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
    },
    errors: [
      {
        message: 'Object must have required property "channels"',
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'valid case (case when other errors should also occur but we filter them out)',
    document: {
      asyncapi: '2.0.0',
      info: {
        title: 'Valid AsyncApi document',
        version: '1.0',
      },
      channels: {
        someChannel: {
          publish: {
            $ref: '#/components/x-operations/someOperation',
          },
        },
      },
      components: {
        'x-operations': {
          someOperation: {},
        },
      },
    },
    errors: [],
  },
]);
