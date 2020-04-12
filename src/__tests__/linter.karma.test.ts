import { FetchMockSandbox } from 'fetch-mock';
import { Spectral } from '../spectral';

describe('Linter', () => {
  let fetchMock: FetchMockSandbox;
  let spectral: Spectral;

  beforeEach(() => {
    fetchMock = require('fetch-mock').sandbox();
    window.fetch = fetchMock;
    spectral = new Spectral();
  });

  afterEach(() => {
    window.fetch = fetch;
  });

  describe('custom functions', () => {
    it('should be able to make a request using fetch', async () => {
      fetchMock.mock('https://stoplight.io', {
        status: 200,
      });

      spectral.setRuleset({
        exceptions: {},
        functions: {
          fn: {
            source: null,
            schema: null,
            name: 'fn',
            code: `module.exports = () => void fetch('https://stoplight.io')`,
          },
        },
        rules: {
          empty: {
            given: '$',
            then: {
              function: 'fn',
            },
          },
        },
      });

      await spectral.run({});

      expect(fetchMock.calls('https://stoplight.io')).toHaveLength(1);
    });
  });
});
