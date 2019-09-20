import * as http from 'http';
import * as url from 'url';
import { httpAndFileResolver } from '../resolvers/http-and-file';
import { Spectral } from '../spectral';

const PORT = 4001;

describe('request', () => {
  const oldProxyEnv = process.env.PROXY;
  let server: http.Server;

  beforeAll(() => {
    // nock cannot mock proxied requests
    server = http
      .createServer((req, res) => {
        const { pathname } = url.parse(String(req.url));
        if (pathname === '/custom-ruleset') {
          res.writeHead(403);
        } else if (pathname === '/ok.json') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(
            JSON.stringify({
              info: {
                title: '',
                description: 'Foo',
              },
            }),
          );
        } else {
          res.writeHead(404);
        }

        res.end();
      })
      .listen(PORT, '0.0.0.0');
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    process.env.PROXY = `http://localhost:${PORT}/`;
  });

  afterEach(() => {
    process.env.PROXY = oldProxyEnv;
  });

  describe('loading a ruleset', () => {
    it('proxies the request', () => {
      const s = new Spectral();

      return expect(s.loadRuleset('http://localhost:4000/custom-ruleset')).rejects.toHaveProperty(
        'message',
        'Could not parse http://localhost:4000/custom-ruleset: Forbidden',
      );
    });
  });

  describe('loading a $ref', () => {
    it('proxies the request', () => {
      const doc = {
        info: {
          $ref: 'http://localhost:8089/ok.json#/info',
        },
      };

      const s = new Spectral({ resolver: httpAndFileResolver });

      return expect(s.runWithResolved(doc)).resolves.toHaveProperty('resolved', {
        info: {
          title: '',
          description: 'Foo',
        },
      });
    });
  });
});
