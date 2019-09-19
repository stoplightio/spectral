import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from 'path';
import { isOpenApiv2 } from '../formats';
import { httpAndFileResolver } from '../resolvers/http-and-file';
import { Spectral } from '../spectral';

const oasRuleset = require('../rulesets/oas/index.json');
const customOASRuleset = require('./__fixtures__/custom-oas-ruleset.json');

describe('Spectral', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('loadRuleset', () => {
    test('should support loading rulesets from filesystem', async () => {
      const s = new Spectral();
      await s.loadRuleset(path.join(__dirname, '__fixtures__/custom-oas-ruleset.json'));

      expect(s.rules).toEqual(
        expect.objectContaining({
          ...[...Object.entries(oasRuleset.rules)].reduce<Dictionary<unknown>>((oasRules, [name, rule]) => {
            oasRules[name] = {
              name,
              ...rule,
              formats: expect.arrayContaining([expect.any(String)]),
              severity: expect.any(Number),
              then: expect.any(Object),
            };

            return oasRules;
          }, {}),
          'info-matches-stoplight': {
            ...customOASRuleset.rules['info-matches-stoplight'],
            name: 'info-matches-stoplight',
            severity: DiagnosticSeverity.Warning,
          },
        }),
      );
    });

    test('should support loading rulesets over http', async () => {
      const ruleset = {
        rules: {
          'info-matches-stoplight': {
            message: 'Info must contain Stoplight',
            given: '$.info',
            type: 'style',
            then: {
              field: 'title',
              function: 'pattern',
              functionOptions: {
                match: 'Stoplight',
              },
            },
          },
        },
      };

      nock('https://localhost:4000')
        .get('/custom-ruleset')
        .reply(200, JSON.stringify(ruleset));

      const s = new Spectral();
      await s.loadRuleset('https://localhost:4000/custom-ruleset');

      expect(s.rules).toEqual({
        'info-matches-stoplight': {
          ...ruleset.rules['info-matches-stoplight'],
          name: 'info-matches-stoplight',
          severity: -1,
        },
      });
    });
  });

  test('reports issues for correct files with correct ranges and paths', async () => {
    const documentUri = path.join(__dirname, './__fixtures__/document-with-external-refs.oas2.json');
    const spectral = new Spectral({ resolver: httpAndFileResolver });
    await spectral.loadRuleset('spectral:oas');
    spectral.registerFormat('oas2', isOpenApiv2);
    const parsed = {
      parsed: parseWithPointers(fs.readFileSync(documentUri, 'utf8')),
      getLocationForJsonPath,
    };

    const results = await spectral.run(parsed, {
      resolve: {
        documentUri,
      },
    });

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'oas2-schema',
          path: ['paths', '/todos/{todoId}', 'get', 'responses', '200'],
          range: {
            end: {
              character: 11,
              line: 31,
            },
            start: {
              character: 17,
              line: 16,
            },
          },
          source: undefined,
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          path: ['paths', '/todos/{todoId}', 'get', 'responses', '200', 'schema'],
          range: {
            end: {
              character: 1,
              line: 37,
            },
            start: {
              character: 0,
              line: 0,
            },
          },
          source: expect.stringContaining('__fixtures__/models/todo-full.v1.json'),
        }),
        expect.objectContaining({
          code: 'path-params',
          path: ['paths', '/todos/{todoId}'],
          range: {
            end: {
              character: 5,
              line: 34,
            },
            start: {
              character: 23,
              line: 10,
            },
          },
          source: undefined,
        }),
        expect.objectContaining({
          code: 'info-contact',
          path: ['info'],
          range: {
            end: {
              character: 3,
              line: 6,
            },
            start: {
              character: 10,
              line: 2,
            },
          },
          source: undefined,
        }),
        expect.objectContaining({
          code: 'operation-description',
          path: ['paths', '/todos/{todoId}', 'get'],
          range: {
            end: {
              character: 7,
              line: 33,
            },
            start: {
              character: 13,
              line: 11,
            },
          },
          source: undefined,
        }),
      ]),
    );
  });
});
