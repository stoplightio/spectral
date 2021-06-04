import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('no-$ref-siblings', [
  {
    name: '$ref siblings are present',
    document: {
      $ref: '#/',
      responses: {
        200: {
          description: 'a',
        },
        201: {
          description: 'b',
        },
        300: {
          description: 'c',
          abc: 'd',
          $ref: '#/d',
        },
      },
      openapi: '3.0.0',
    },
    errors: [
      {
        message: '$ref cannot be placed next to any other properties',
        path: ['responses'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref cannot be placed next to any other properties',
        path: ['responses', '300', 'description'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref cannot be placed next to any other properties',
        path: ['responses', '300', 'abc'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref cannot be placed next to any other properties',
        path: ['openapi'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
