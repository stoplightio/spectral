import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { FetchMockSandbox } from 'fetch-mock';
import { Spectral } from '../spectral';

const { fetch } = window;

const oasRuleset = require('../rulesets/oas/index.json');
const oas2Ruleset = require('../rulesets/oas2/index.json');
const oas3Ruleset = require('../rulesets/oas3/index.json');

describe('Spectral', () => {
  describe('loadRuleset', () => {
    let fetchMock: FetchMockSandbox;

    beforeEach(() => {
      fetchMock = require('fetch-mock').sandbox();
      window.fetch = fetchMock;
    });

    afterEach(() => {
      window.fetch = fetch;
    });

    test('should support loading built-in rulesets', async () => {
      fetchMock.mock('https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json', {
        status: 200,
        body: oasRuleset,
      });

      fetchMock.mock('https://unpkg.com/@stoplight/spectral/rulesets/oas2/index.json', {
        status: 200,
        body: oas2Ruleset,
      });

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
      fetchMock.mock('https://unpkg.com/@stoplight/spectral/rulesets/oas/index.json', {
        status: 200,
        body: oasRuleset,
      });

      fetchMock.mock('https://unpkg.com/@stoplight/spectral/rulesets/oas2/index.json', {
        status: 200,
        body: oas2Ruleset,
      });

      fetchMock.mock('https://unpkg.com/@stoplight/spectral/rulesets/oas3/index.json', {
        status: 200,
        body: oas3Ruleset,
      });

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

      fetchMock.mock('https://localhost:4000/custom-ruleset', {
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
