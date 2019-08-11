import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { FetchMockSandbox } from 'fetch-mock';
import * as path from 'path';
import { Spectral } from '../spectral';
const fetch = require('node-fetch');

const oasRuleset = require('../rulesets/oas/index.json');
const oas2Ruleset = require('../rulesets/oas2/index.json');
const oas3Ruleset = require('../rulesets/oas3/index.json');
const customOASRuleset = require('./__fixtures__/custom-oas-ruleset.json');

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
    test('should support loading built-in rulesets', async () => {
      const s = new Spectral();
      await s.loadRuleset('spectral:oas2');

      expect(s.rules).toEqual(
        [...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
          (oasRules, [name, rule]) => {
            oasRules[name] = {
              name,
              ...rule,
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

      (fetch as FetchMockSandbox).mock('https://localhost:4000/custom-ruleset', {
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
