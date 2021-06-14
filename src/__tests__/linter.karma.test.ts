import { FetchMockSandbox } from 'fetch-mock';
import { Spectral } from '../spectral';

describe('Linter', () => {
  let fetchMock: FetchMockSandbox;
  let spectral: Spectral;

  beforeEach(() => {
    fetchMock = require('fetch-mock').default.sandbox();
    window.fetch = fetchMock;
    spectral = new Spectral();
  });

  afterEach(() => {
    window.fetch = fetch;
  });

  describe('default resolver', () => {
    it('should not use a resolver that depends on the Node.js "fs" module', async () => {
      const result = await spectral.run({
        info: {
          $ref: './foo/bar.json',
        },
      });

      expect(result[0]).toHaveProperty('message', "No resolver defined for scheme 'file' in ref ./foo/bar.json");
    });
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
