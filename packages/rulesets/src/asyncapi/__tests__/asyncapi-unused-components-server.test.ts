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

const document_v3 = {
  asyncapi: '3.0.0',
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
    name: 'valid v3 case',
    document: document_v3,
    errors: [],
  },

  {
    name: 'v3 components.servers contains unreferenced objects',
    document: produce(document_v3, (draft: any) => {
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
