import { isOpenApiv2, isOpenApiv3 } from '../../../formats';
import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';
import refSiblings from '../functions/refSiblings';

describe('no-$ref-siblings', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();
    s.registerFormat('oas2', isOpenApiv2);
    s.registerFormat('oas3', isOpenApiv3);
    s.setFunctions({ refSiblings });
    s.setRules({
      'no-$ref-siblings': Object.assign({}, ruleset.rules['no-$ref-siblings'], {
        recommended: true,
        type: RuleType[ruleset.rules['no-$ref-siblings'].type],
      }),
    });
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

    expect(results).toEqual(
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
