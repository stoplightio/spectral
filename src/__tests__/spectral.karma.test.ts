import { DiagnosticSeverity } from '@stoplight/types/dist';
import { FetchMockSandbox } from 'fetch-mock';
import { Spectral } from '../spectral';

describe('Spectral', () => {
  let fetchMock: FetchMockSandbox;

  beforeEach(() => {
    fetchMock = require('fetch-mock').default.sandbox();
    window.fetch = fetchMock;
  });

  afterEach(() => {
    window.fetch = fetch;
  });

  describe('loadRuleset', () => {
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
        'info-matches-stoplight': expect.objectContaining({
          given: ['$.info'],
          name: 'info-matches-stoplight',
          message: 'Info must contain Stoplight',
          enabled: true,
          severity: DiagnosticSeverity.Warning,
        }),
      });
    });
  });
});
