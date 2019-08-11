import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import * as path from 'path';
import { Spectral } from '../spectral';

const oasRuleset = require('../rulesets/oas/index.json');
const customOASRuleset = require('./__fixtures__/custom-oas-ruleset.json');

const fetch = require('node-fetch');

jest.mock(
  'node-fetch',
  (() => {
    // I know it might look weird, and it in fact is, so let me explain.
    // There was some weird issue I had to mitigate against.
    // Basically, if you deferred loading of fetch-mock module, sandbox method was no longer there for some reason.
    const fetchMock = require('fetch-mock');
    return () => fetchMock.sandbox();
  })(),
);

describe('Spectral', () => {
  describe('loadRuleset', () => {
    test('should support loading rulesets from filesystem', async () => {
      const s = new Spectral();
      await s.loadRuleset(path.join(__dirname, '__fixtures__/custom-oas-ruleset.json'));

      expect(s.rules).toEqual({
        ...[...Object.entries(oasRuleset.rules)].reduce<Dictionary<unknown>>((oasRules, [name, rule]) => {
          oasRules[name] = {
            name,
            ...rule,
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

      fetch.mock('https://localhost:4000/custom-ruleset', {
        status: 200,
        body: ruleset,
      });

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
