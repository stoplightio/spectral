import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('no-$ref-siblings', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['no-$ref-siblings']);
  });

  test('reports ref siblings', async () => {
    const results = await s.run({
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
    });

    expect([...results]).toEqual(
      expect.arrayContaining([
        {
          code: 'no-$ref-siblings',
          message: '$ref cannot be placed next to any other properties',
          path: ['responses'],
          range: {
            end: {
              character: 19,
              line: 12,
            },
            start: {
              character: 14,
              line: 2,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: 'no-$ref-siblings',
          message: '$ref cannot be placed next to any other properties',
          path: ['responses', '300', 'description'],
          range: {
            end: {
              character: 24,
              line: 10,
            },
            start: {
              character: 21,
              line: 10,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: 'no-$ref-siblings',
          message: '$ref cannot be placed next to any other properties',
          path: ['responses', '300', 'abc'],
          range: {
            end: {
              character: 16,
              line: 11,
            },
            start: {
              character: 13,
              line: 11,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
      ]),
    );
  });
});
