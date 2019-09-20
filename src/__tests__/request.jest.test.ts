import { httpAndFileResolver } from '../resolvers/http-and-file';
import { Spectral } from '../spectral';

describe('request', () => {
  const oldProxyEnv = process.env.PROXY;

  beforeEach(() => {
    process.env = { PROXY: 'http://localhost:3000/' };
  });

  afterEach(() => {
    process.env.proxy = oldProxyEnv;
  });

  describe('loading a ruleset', () => {
    it('proxies the request', async () => {
      const s = new Spectral();

      try {
        await s.loadRuleset('http://localhost:4000/custom-ruleset');
      } catch (e) {
        expect(e.message).toBe(
          'Could not parse http://localhost:4000/custom-ruleset: request to http://localhost:4000/custom-ruleset failed, reason: connect ECONNREFUSED 127.0.0.1:3000',
        );
      }
    });
  });

  describe('loading a $ref', () => {
    it('proxies the request', async () => {
      const spec = {
        openapi: '3.0.2',
        paths: {
          '/pets': {
            get: {
              responses: {
                '200': {
                  description: 'abc',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: 'http://localhost:8089/ok.json',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const s = new Spectral({ resolver: httpAndFileResolver });
      const results = await s.run(spec);

      expect(results[0].message).toBe(
        'FetchError: request to http://localhost:8089/ok.json failed, reason: connect ECONNREFUSED 127.0.0.1:3000',
      );
    });
  });
});
