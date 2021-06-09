import { join, resolve } from '@stoplight/path';
import * as nock from 'nock';
import * as yargs from 'yargs';
import { ValidationError } from '../../../ruleset/validation';
import lintCommand from '../../commands/lint';
import { lint } from '../linter';
import * as http from 'http';
import * as url from 'url';
import { DEFAULT_REQUEST_OPTIONS } from '../../../request';
import * as ProxyAgent from 'proxy-agent';
import { DiagnosticSeverity } from '@stoplight/types';

jest.mock('../output');

const validCustomOas3SpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid-custom.yaml');
const invalidRulesetPath = resolve(__dirname, '__fixtures__/ruleset-invalid.yaml');
const validRulesetPath = resolve(__dirname, '__fixtures__/ruleset-valid.yaml');
const validOas3SpecPath = resolve(__dirname, './__fixtures__/openapi-3.0-valid.yaml');

async function run(command: string) {
  const parser = yargs.command(lintCommand);
  const { documents, ...opts } = await new Promise<any>((resolve, reject) => {
    parser.parse(`${command} --ignore-unknown-format`, {}, (err, argv) => {
      if (err) {
        reject(err);
      } else {
        resolve(argv);
      }
    });
  });

  return lint(documents, opts);
}

describe('Linter service', () => {
  let consoleLogSpy: jest.SpyInstance;
  let processCwdSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      // no-op
    });

    processCwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(join(__dirname, '__fixtures__'));
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    processCwdSpy.mockRestore();

    nock.cleanAll();
  });

  it('handles relative path to a document', async () => {
    const results = await run('lint -r ./gh-474/ruleset.json ./gh-474/document.json');

    expect(results).toEqual([
      {
        code: 'defined-name',
        message: '`name` property must be truthy',
        path: ['0', 'name'],
        range: {
          end: {
            character: 16,
            line: 1,
          },
          start: {
            character: 12,
            line: 1,
          },
        },
        severity: DiagnosticSeverity.Warning,
        source: join(__dirname, './__fixtures__/gh-474/common.json'),
      },
      {
        code: 'defined-name',
        message: '`name` property must be truthy',
        path: ['1', 'name'],
        range: {
          end: {
            character: 16,
            line: 2,
          },
          start: {
            character: 12,
            line: 2,
          },
        },
        severity: DiagnosticSeverity.Warning,
        source: join(__dirname, './__fixtures__/gh-474/common.json'),
      },
    ]);
  });

  describe('when document is local file', () => {
    describe('and the file is expected to have no warnings', () => {
      it('outputs no issues', () => {
        return expect(run(`lint stoplight-info-document.json`)).resolves.toEqual([]);
      });
    });

    describe('and the file is expected to trigger warnings', () => {
      it('outputs warnings', async () => {
        return expect(run('lint missing-stoplight-info-document.json')).resolves.toEqual([
          {
            code: 'info-matches-stoplight',
            message: 'Info must contain Stoplight',
            path: ['info', 'title'],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Warning,
            source: join(__dirname, `./__fixtures__/missing-stoplight-info-document.json`),
          },
        ]);
      });
    });
  });

  it('given a list of files is provided, outputs issues for each file', () => {
    const documents = [
      join(__dirname, `./__fixtures__/missing-stoplight-info-document.json`),
      join(__dirname, `./__fixtures__/missing-stoplight-info-document-copy.json`),
    ];

    return expect(run(['lint', ...documents].join(' '))).resolves.toEqual([
      {
        code: 'info-matches-stoplight',
        message: 'Info must contain Stoplight',
        path: ['info', 'title'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
        source: documents[0],
      },
      {
        code: 'info-matches-stoplight',
        message: 'Info must contain Stoplight',
        path: ['info', 'title'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
        source: documents[1],
      },
    ]);
  });

  describe('when glob is provided', () => {
    const documents = join(__dirname, `./__fixtures__/missing-stoplight-info*.json`);

    it('outputs issues for each file', () => {
      return expect(run(`lint ${documents}`)).resolves.toEqual([
        {
          code: 'info-matches-stoplight',
          message: 'Info must contain Stoplight',
          path: ['info', 'title'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
          source: join(__dirname, `./__fixtures__/missing-stoplight-info-document-copy.json`),
        },
        {
          code: 'info-matches-stoplight',
          message: 'Info must contain Stoplight',
          path: ['info', 'title'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
          source: join(__dirname, `./__fixtures__/missing-stoplight-info-document.json`),
        },
      ]);
    });

    it('unixifies patterns', () => {
      return expect(run(`lint } ${documents.replace(/\//g, '\\')}`)).resolves.toEqual([
        {
          code: 'info-matches-stoplight',
          message: 'Info must contain Stoplight',
          path: ['info', 'title'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
          source: join(__dirname, `./__fixtures__/missing-stoplight-info-document-copy.json`),
        },
        {
          code: 'info-matches-stoplight',
          message: 'Info must contain Stoplight',
          path: ['info', 'title'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
          source: join(__dirname, `./__fixtures__/missing-stoplight-info-document.json`),
        },
      ]);
    });
  });

  describe('--ruleset', () => {
    const validNestedRulesetPath = join(__dirname, '__fixtures__/ruleset-extends-valid.yaml');
    const invalidNestedRulesetPath = join(__dirname, '__fixtures__/ruleset-extends-invalid.yaml');

    describe('extends feature', () => {
      it('extends a valid relative ruleset', () => {
        return expect(run(`lint ${validCustomOas3SpecPath} -r ${validNestedRulesetPath}`)).resolves.toEqual([]);
      });

      it('fails trying to extend an invalid relative ruleset', () => {
        return expect(run(`lint ${validCustomOas3SpecPath} -r ${invalidNestedRulesetPath}`)).rejects.toThrowError(
          ValidationError,
        );
      });

      it('given remote nested ruleset, resolves', () => {
        nock('http://foo.local')
          .persist()
          .get('/ruleset-master.yaml')
          .replyWithFile(200, validNestedRulesetPath, {
            'Content-Type': 'application/yaml',
          })
          .get('/ruleset-valid.yaml')
          .replyWithFile(200, validRulesetPath, {
            'Content-Type': 'application/yaml',
          });

        return expect(run(`lint ${validCustomOas3SpecPath} -r http://foo.local/ruleset-master.yaml`)).resolves.toEqual(
          [],
        );
      });
    });

    describe('when multiple ruleset options provided', () => {
      it('given one is valid other is not, outputs "invalid ruleset" error', () => {
        return expect(
          run(`lint ${validCustomOas3SpecPath} -r ${invalidRulesetPath} -r ${validRulesetPath}`),
        ).rejects.toThrowError(ValidationError);
      });
    });

    describe('when single ruleset option provided', () => {
      it('outputs "does not exist" error', () => {
        return expect(run(`lint ${validOas3SpecPath} -r non-existent-path`)).rejects.toThrow(
          'ENOENT: no such file or directory',
        );
      });

      it('outputs "invalid ruleset" error', () => {
        return expect(run(`lint ${validOas3SpecPath} -r ${invalidRulesetPath}`)).rejects.toThrowError(ValidationError);
      });

      it('outputs no issues', () => {
        return expect(run(`lint ${validCustomOas3SpecPath} -r ${validRulesetPath}`)).resolves.toEqual([]);
      });

      it('outputs warnings', async () => {
        const output = await run(`lint ${validOas3SpecPath} -r ${validRulesetPath}`);
        expect(output).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'info-matches-stoplight' })]));
        expect(output).toEqual(
          expect.not.arrayContaining([
            expect.objectContaining({
              message: 'Info object should contain `contact` object',
            }),
          ]),
        );
      });

      it('given valid remote ruleset file, outputs no issues', () => {
        nock('http://foo.local').persist().get('/ruleset.yaml').replyWithFile(200, validRulesetPath, {
          'Content-Type': 'application/yaml',
        });

        return expect(run(`lint ${validCustomOas3SpecPath} -r http://foo.local/ruleset.yaml`)).resolves.toEqual([]);
      });
    });
  });

  describe('when loading specification files from web', () => {
    it('outputs no issues', () => {
      const document = join(__dirname, `./__fixtures__/stoplight-info-document.json`);
      nock('http://foo.local').persist().get('/openapi').replyWithFile(200, document, {
        'Content-Type': 'application/yaml',
      });

      return expect(run('lint http://foo.local/openapi')).resolves.toEqual([]);
    });

    it('throws if cannot load URI', () => {
      nock('http://foo.local').persist().get('/openapi').reply(404);

      return expect(run('lint http://foo.local/openapi')).rejects.toThrow(
        'Could not parse http://foo.local/openapi: Not Found',
      );
    });

    it('outputs warnings', () => {
      const document = join(__dirname, `./__fixtures__/missing-stoplight-info-document.json`);
      nock('http://foo.local').persist().get('/openapi').replyWithFile(200, document, {
        'Content-Type': 'application/yaml',
      });

      return expect(run(`lint http://foo.local/openapi`)).resolves.toEqual([
        {
          code: 'info-matches-stoplight',
          message: 'Info must contain Stoplight',
          path: ['info', 'title'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
          source: 'http://foo.local/openapi',
        },
      ]);
    });
  });

  describe('when using default ruleset file', () => {
    it('respects rules from a ruleset file', () => {
      return expect(run('lint missing-stoplight-info-document.json')).resolves.toEqual([
        expect.objectContaining({
          code: 'info-matches-stoplight',
          message: 'Info must contain Stoplight',
        }),
      ]);
    });
  });

  describe('$ref linting', () => {
    it('outputs errors occurring in referenced files', () => {
      return expect(run(`lint -r references/ruleset.json references/no-nested.json`)).resolves.toEqual([
        expect.objectContaining({
          code: 'valid-schema',
          message: '`info` property must have required property `version`',
          path: ['definitions', 'info'],
          range: {
            end: {
              character: 5,
              line: 8,
            },
            start: {
              character: 12,
              line: 3,
            },
          },
          source: expect.stringContaining('/__tests__/__fixtures__/references/common/info.json'),
        }),
        expect.objectContaining({
          code: 'valid-schema',
          message: '`description` property type must be string',
          path: ['definitions', 'info', 'description'],
          range: {
            end: {
              character: 22,
              line: 4,
            },
            start: {
              character: 21,
              line: 4,
            },
          },
          source: expect.stringContaining('/__tests__/__fixtures__/references/common/info.json'),
        }),
        expect.objectContaining({
          code: 'valid-schema',
          message: 'Property `foo` is not expected to be here',
          path: ['paths'],
          range: {
            end: {
              character: 13,
              line: 6,
            },
            start: {
              character: 10,
              line: 4,
            },
          },
          source: expect.stringContaining('__tests__/__fixtures__/references/no-nested.json'),
        }),
      ]);
    });

    it('outputs errors occurring in nested referenced files', () => {
      return expect(run(`lint -r references/ruleset.json references/nested.json`)).resolves.toEqual([
        expect.objectContaining({
          code: 'valid-schema',
          message: '`info` property must have required property `version`',
          path: [],
          range: {
            end: {
              character: 1,
              line: 3,
            },
            start: {
              character: 0,
              line: 0,
            },
          },
          source: expect.stringContaining('__tests__/__fixtures__/references/common/contact.json'),
        }),
        expect.objectContaining({
          code: 'valid-schema',
          message: '`description` property type must be string',
          path: ['description'],
          range: {
            end: {
              character: 18,
              line: 2,
            },
            start: {
              character: 17,
              line: 2,
            },
          },
          source: expect.stringContaining('__tests__/__fixtures__/references/common/contact.json'),
        }),
        expect.objectContaining({
          code: 'valid-schema',
          message: '`get` property must have required property `responses`',
          path: ['paths', '/test', 'get'],
          range: {
            end: {
              character: 7,
              line: 5,
            },
            start: {
              character: 13,
              line: 3,
            },
          },
          source: expect.stringContaining('__tests__/__fixtures__/references/common/paths.json'),
        }),
        expect.objectContaining({
          code: 'valid-schema',
          message: '`response` property type must be number',
          path: ['paths', '/test', 'get', 'response'],
          range: {
            end: {
              character: 25,
              line: 4,
            },
            start: {
              character: 20,
              line: 4,
            },
          },
          source: expect.stringContaining('__tests__/__fixtures__/references/common/paths.json'),
        }),
      ]);
    });
  });

  describe('--resolver', () => {
    it('uses provided resolver for $ref resolving', async () => {
      const resolver = join(__dirname, '__fixtures__/resolver/resolver.js');
      const document = join(__dirname, '__fixtures__/resolver/document.json');

      expect(await run(`lint --resolver ${resolver} ${document}`)).toEqual([
        {
          code: 'info-matches-stoplight',
          message: 'Info must contain Stoplight',
          path: ['info', 'title'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Warning,
        },
      ]);
    });
  });

  describe('proxy', () => {
    let server: http.Server;
    const PORT = 4001;

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

    describe('when agent is set', () => {
      beforeEach(() => {
        DEFAULT_REQUEST_OPTIONS.agent = new ProxyAgent(`http://localhost:${PORT}`) as any;
      });

      afterEach(() => {
        delete DEFAULT_REQUEST_OPTIONS.agent;
      });

      describe('loading a ruleset', () => {
        it('proxies the request', async () => {
          await expect(
            run(`lint --ruleset http://localhost:4000/custom-ruleset src/__tests__/__fixtures__/petstore.oas3.json`),
          ).rejects.toThrowErrorMatchingInlineSnapshot(
            `"Could not parse http://localhost:4000/custom-ruleset: Forbidden"`,
          );
        });
      });
    });
  });
});
