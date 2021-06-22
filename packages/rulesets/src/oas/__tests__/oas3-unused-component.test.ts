import { DiagnosticSeverity } from '@stoplight/types';
import * as path from '@stoplight/path';
import * as Parsers from '@stoplight/spectral-parsers';
import { Document } from '@stoplight/spectral-core';

import testRule from '../../__tests__/__helpers__/tester';

const remoteLocalDocument = new Document<any, any>(
  JSON.stringify(require('./__fixtures__/unusedShared/unusedComponentsSchema.remoteLocal.json')),
  Parsers.Json,
  path.join(__dirname, './__fixtures__/unusedShared/unusedComponentsSchema.remoteLocal.json'),
);
const definitionDocument = new Document<any, any>(
  JSON.stringify(require('./__fixtures__/unusedShared/unusedComponentsSchema.definition.json')),
  Parsers.Json,
  path.join(__dirname, './__fixtures__/unusedShared/unusedComponentsSchema.definition.json'),
);
const indirectDocument = new Document<any, any>(
  JSON.stringify(require('./__fixtures__/unusedShared/unusedComponentsSchema.indirect.1.json')),
  Parsers.Json,
  path.join(__dirname, './__fixtures__/unusedShared/unusedComponentsSchema.indirect.1.json'),
);
const indirect2Document = new Document<any, any>(
  JSON.stringify(require('./__fixtures__/unusedShared/unusedComponentsSchema.indirect.2.json')),
  Parsers.Json,
  path.join(__dirname, './__fixtures__/unusedShared/unusedComponentsSchema.indirect.2.json'),
);

testRule('oas3-unused-component', [
  {
    name: 'empty object',
    document: {
      openapi: '3.0.0',
    },

    errors: [],
  },

  {
    name: 'meeting an invalid json pointer',
    document: {
      openapi: '3.0.0',
      'x-hook': {
        $ref: "'$#@!!!' What?",
      },
      paths: {},
      components: {
        schemas: {
          NotHooked: {
            type: 'object',
          },
        },
      },
    },
    errors: [
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'schemas', 'NotHooked'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'all components are referenced',
    document: require('../../__tests__/__fixtures__/unusedComponent.negative.json'),
    errors: [],
  },

  {
    name: 'orphaned components',
    document: require('../../__tests__/__fixtures__/unusedComponent.json'),

    errors: [
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'schemas', 'SomeSchema'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'parameters', 'SomeParameter'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'requestBodies', 'SomeBody'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'callbacks', 'SomeCallback'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'examples', 'SomeExample'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'headers', 'SomeHeader'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'links', 'SomeLink'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'responses', 'SomeResponse'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'unreferenced components when analyzing an in-memory document',
    document: {
      openapi: '3.0.0',
      'x-hook': {
        $ref: '#/components/schemas/Hooked',
      },
      'x-also-hook': {
        $ref: '#/components/schemas/Hooked',
      },
      paths: {
        '/path': {
          post: {
            parameters: [
              {
                $ref: '#/components/schemas/HookedAsWell',
              },
              {
                $ref: `${definitionDocument}#/components/schemas/ExternalFs`,
              },
              {
                $ref: 'https://oas3.library.com/defs.json#/components/schemas/ExternalHttp',
              },
            ],
          },
        },
      },
      components: {
        schemas: {
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
    },
    errors: [
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'schemas', 'Unhooked'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
    mocks: {
      'https://oas3.library.com/defs.json': {
        components: {
          schemas: {
            ExternalHttp: {
              type: 'number',
            },
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
        message: 'Potentially unused component has been detected.',
        path: ['components', 'schemas', 'Unhooked'],
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
