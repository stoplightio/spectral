import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';
import * as path from '@stoplight/path';
import { Document } from '../../../document';
import * as Parsers from '../../../parsers';

const remoteLocalDocument = new Document<any, any>(
  JSON.stringify(require('./__fixtures__/unusedShared/unusedDefinition.remoteLocal.json')),
  Parsers.Json,
  path.join(__dirname, './__fixtures__/unusedShared/unusedDefinition.remoteLocal.json'),
);
const definitionDocument = new Document<any, any>(
  JSON.stringify(require('./__fixtures__/unusedShared/unusedDefinition.definition.json')),
  Parsers.Json,
  path.join(__dirname, './__fixtures__/unusedShared/unusedDefinition.definition.json'),
);
const indirectDocument = new Document<any, any>(
  JSON.stringify(require('./__fixtures__/unusedShared/unusedDefinition.indirect.1.json')),
  Parsers.Json,
  path.join(__dirname, './__fixtures__/unusedShared/unusedDefinition.indirect.1.json'),
);
const indirect2Document = new Document<any, any>(
  JSON.stringify(require('./__fixtures__/unusedShared/unusedDefinition.indirect.2.json')),
  Parsers.Json,
  path.join(__dirname, './__fixtures__/unusedShared/unusedDefinition.indirect.2.json'),
);

testRule('oas2-unused-definition', [
  {
    name: 'empty object',
    document: {
      swagger: '2.0',
    },
    errors: [],
  },

  {
    name: 'meeting an invalid json pointer',
    document: {
      swagger: '2.0',
      'x-hook': {
        $ref: "'$#@!!!' What?",
      },
      paths: {},
      definitions: {
        NotHooked: {
          type: 'object',
        },
      },
    },
    errors: [
      {
        message: 'Potentially unused definition has been detected.',
        path: ['definitions', 'NotHooked'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'all components are referenced',
    document: {
      swagger: '2.0',
      'x-hook': {
        $ref: '#/definitions/Hooked',
      },
      'x-also-hook': {
        $ref: '#/definitions/Hooked',
      },
      paths: {
        '/path': {
          post: {
            parameters: [
              {
                $ref: '#/definitions/HookedAsWell',
              },
            ],
          },
        },
      },
      definitions: {
        Hooked: {
          type: 'object',
        },
        HookedAsWell: {
          name: 'value',
          in: 'query',
          type: 'number',
        },
      },
    },
    errors: [],
  },

  {
    name: 'orphaned components',
    document: {
      swagger: '2.0',
      paths: {
        '/path': {
          post: {},
        },
      },
      definitions: {
        BouhouhouIamUnused: {
          type: 'object',
        },
      },
    },
    errors: [
      {
        message: 'Potentially unused definition has been detected.',
        path: ['definitions', 'BouhouhouIamUnused'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'unreferenced definitions when analyzing an in-memory document',
    document: {
      swagger: '2.0',
      'x-hook': {
        $ref: '#/definitions/Hooked',
      },
      'x-also-hook': {
        $ref: '#/definitions/Hooked',
      },
      paths: {
        '/path': {
          post: {
            parameters: [
              {
                $ref: '#/definitions/HookedAsWell',
              },
              {
                $ref: definitionDocument.source!,
              },
              {
                $ref: 'https://oas2.library.com/defs.json#/definitions/ExternalHttp',
              },
            ],
          },
        },
      },
      definitions: {
        Hooked: {
          type: 'object',
        },
        HookedAsWell: {
          name: 'value',
          in: 'query',
          type: 'number',
        },
        Unhooked: {
          type: 'object',
        },
      },
    },
    errors: [
      {
        message: 'Potentially unused definition has been detected.',
        path: ['definitions', 'Unhooked'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
    mocks: {
      'https://oas2.library.com/defs.json': {
        definitions: {
          ExternalHttp: {
            type: 'number',
          },
        },
      },
      [definitionDocument.source!]: definitionDocument.data,
    },
  },

  {
    name: 'a directly self-referencing document from the filesystem',
    document: remoteLocalDocument,
    errors: [],
    mocks: {
      [remoteLocalDocument.source!]: remoteLocalDocument.data,
    },
  },

  {
    name: 'an indirectly self-referencing document from the filesystem',
    document: indirectDocument,
    errors: [
      {
        message: 'Potentially unused definition has been detected.',
        path: ['definitions', 'Unhooked'],
        severity: DiagnosticSeverity.Warning,
        source: indirectDocument.source!,
      },
    ],
    mocks: {
      [indirectDocument.source!]: indirectDocument.data,
      [indirect2Document.source!]: indirect2Document.data,
    },
  },
]);
