import { DiagnosticSeverity } from '@stoplight/types';
import { Document } from '../../../document';
import type { Spectral } from '../../../index';
import * as Parsers from '../../../parsers';
import { createWithRules } from './__helpers__/createWithRules';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';

const noUnusedComponents = JSON.stringify(require('../../__tests__/__fixtures__/unusedComponent.negative.json'));
const unusedComponents = JSON.stringify(require('../../__tests__/__fixtures__/unusedComponent.json'));

describe('oasUnusedComponent - Local references', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas3-unused-component'], { resolver: httpAndFileResolver });
  });

  test('does not report anything for empty object', async () => {
    const results = await s.run({
      openapi: '3.0.0',
    });

    expect([...results]).toEqual([]);
  });

  test('does not throw when meeting an invalid json pointer', async () => {
    const doc = `{
      "openapi": "3.0.0",
      "x-hook": {
        "$ref": "'$#@!!!' What?"
      },
      "paths": {
      },
      "components": {
        "schemas": {
          "NotHooked": {
            "type": "object"
          }
        }
      }
    }`;

    const results = await s.run(doc);

    expect([...results]).toEqual([
      expect.objectContaining({
        code: 'invalid-ref',
        path: ['x-hook', '$ref'],
      }),
      {
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
        path: ['components', 'schemas', 'NotHooked'],
        range: {
          end: {
            character: 28,
            line: 10,
          },
          start: {
            character: 22,
            line: 9,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('does not report anything when all the components are referenced', async () => {
    const results = await s.run(new Document(noUnusedComponents, Parsers.Json));

    expect([...results]).toEqual([]);
  });

  test('reports orphaned components', async () => {
    const results = await s.run(new Document(unusedComponents, Parsers.Json));

    expect([...results]).toEqual([
      expect.objectContaining({
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
        path: ['components', 'schemas', 'SomeSchema'],
        severity: DiagnosticSeverity.Warning,
      }),
      expect.objectContaining({
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
        path: ['components', 'parameters', 'SomeParameter'],
        severity: DiagnosticSeverity.Warning,
      }),
      expect.objectContaining({
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
        path: ['components', 'requestBodies', 'SomeBody'],
        severity: DiagnosticSeverity.Warning,
      }),
      expect.objectContaining({
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
        path: ['components', 'callbacks', 'SomeCallback'],
        severity: DiagnosticSeverity.Warning,
      }),
      expect.objectContaining({
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
        path: ['components', 'examples', 'SomeExample'],
        severity: DiagnosticSeverity.Warning,
      }),
      expect.objectContaining({
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
        path: ['components', 'headers', 'SomeHeader'],
        severity: DiagnosticSeverity.Warning,
      }),
      expect.objectContaining({
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
        path: ['components', 'links', 'SomeLink'],
        severity: DiagnosticSeverity.Warning,
      }),
      expect.objectContaining({
        code: 'oas3-unused-component',
        message: 'Potentially unused component has been detected.',
        path: ['components', 'responses', 'SomeResponse'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });
});
