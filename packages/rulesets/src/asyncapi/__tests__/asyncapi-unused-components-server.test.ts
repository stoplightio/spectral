import { DiagnosticSeverity } from '@stoplight/types';
import produce from 'immer';
import testRule from './__helpers__/tester';

const document = {
  asyncapi: '2.0.0',
  servers: {
    test: {
      $ref: '#/components/servers/externallyDefinedServer',
    },
  },
  channels: {},
  components: {
    servers: {
      externallyDefinedServer: {},
    },
  },
};

testRule('asyncapi-unused-components-server', [
  {
    name: 'valid case',
    document,
    errors: [],
  },

  {
    name: 'components.servers contains unreferenced objects',
    document: produce(document, (draft: any) => {
      delete draft.servers['test'];
    }),
    errors: [
      {
        message: 'Potentially unused components server has been detected.',
        path: ['components', 'servers', 'externallyDefinedServer'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
