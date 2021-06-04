import { DiagnosticSeverity } from '@stoplight/types';
import { Parsers, Document } from '../../..';
import testRule from '../../__tests__/__helpers__/tester';

const remoteLocalDocument = require.resolve('./__fixtures__/unusedShared/unusedComponentsSchema.remoteLocal.json');
const definitionDocument = require.resolve('./__fixtures__/unusedShared/unusedComponentsSchema.definition.json');
const indirectDocument = require.resolve('./__fixtures__/unusedShared/unusedComponentsSchema.indirect.1.json');
const indirect2Document = require.resolve('./__fixtures__/unusedShared/unusedComponentsSchema.indirect.2.json');

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
      [definitionDocument]: require(definitionDocument),
    },
  },

  {
    name: 'a directly self-referencing document from the filesystem',
    document: new Document(JSON.stringify(require(remoteLocalDocument)), Parsers.Json, remoteLocalDocument),
    errors: [],
    mocks: {
      [remoteLocalDocument]: require(remoteLocalDocument),
    },
  },

  {
    name: 'an indirectly self-referencing document from the filesystem',
    document: new Document(JSON.stringify(require(indirectDocument)), Parsers.Json, indirectDocument),
    errors: [
      {
        message: 'Potentially unused component has been detected.',
        path: ['components', 'schemas', 'Unhooked'],
        severity: DiagnosticSeverity.Warning,
        source: indirectDocument,
      },
    ],
    mocks: {
      [indirectDocument]: require(indirectDocument),
      [indirect2Document]: require(indirect2Document),
    },
  },
]);
