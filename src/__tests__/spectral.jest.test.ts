import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import * as nock from 'nock';
import * as path from 'path';
import { Spectral } from '../spectral';

const oasRuleset = require('../rulesets/oas/index.json');
const oas2Ruleset = require('../rulesets/oas2/index.json');
const oas3Ruleset = require('../rulesets/oas3/index.json');
const customOASRuleset = require('./__fixtures__/custom-oas-ruleset.json');

describe('Spectral', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('loadRuleset', () => {
    test('should support loading built-in rulesets', async () => {
      const s = new Spectral();
      await s.loadRuleset('spectral:oas2');

      expect(s.rules).toEqual(
        [...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
          (oasRules, [name, rule]) => {
            oasRules[name] = {
              name,
              ...rule,
              formats: expect.arrayContaining([expect.any(String)]),
              severity: expect.any(Number),
            };

            return oasRules;
          },
          {},
        ),
      );
    });

    test('should support loading multiple built-in rulesets', async () => {
      const s = new Spectral();
      await s.loadRuleset('spectral:oas2', 'spectral:oas3');

      expect(s.rules).toEqual(
        [
          ...Object.entries(oasRuleset.rules),
          ...Object.entries(oas2Ruleset.rules),
          ...Object.entries(oas3Ruleset.rules),
        ].reduce<Dictionary<unknown>>((oasRules, [name, rule]) => {
          oasRules[name] = {
            name,
            ...rule,
            formats: expect.arrayContaining([expect.any(String)]),
            severity: expect.any(Number),
          };

          return oasRules;
        }, {}),
      );
    });

    test('should support loading rulesets from filesystem', async () => {
      const s = new Spectral();
      await s.loadRuleset(path.join(__dirname, '__fixtures__/custom-oas-ruleset.json'));

      expect(s.rules).toEqual({
        ...[...Object.entries(oasRuleset.rules)].reduce<Dictionary<unknown>>((oasRules, [name, rule]) => {
          oasRules[name] = {
            name,
            ...rule,
            formats: expect.arrayContaining([expect.any(String)]),
            severity: expect.any(Number),
          };

          return oasRules;
        }, {}),
        'info-matches-stoplight': {
          ...customOASRuleset.rules['info-matches-stoplight'],
          name: 'info-matches-stoplight',
          severity: DiagnosticSeverity.Warning,
        },
      });
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
          severity: DiagnosticSeverity.Warning,
        },
      });
    });
  });
});
