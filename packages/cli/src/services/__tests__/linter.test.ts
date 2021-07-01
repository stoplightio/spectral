import { join, resolve } from '@stoplight/path';
import * as nock from 'nock';
import * as yargs from 'yargs';
import lintCommand from '../../commands/lint';
import { lint } from '../linter';
import { DiagnosticSeverity } from '@stoplight/types';
import { RulesetValidationError } from '@stoplight/spectral-core';

jest.mock('../output');

const validCustomOas3SpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid-custom.yaml');
const invalidRulesetPath = resolve(__dirname, '__fixtures__/ruleset-invalid.js');
const validRulesetPath = resolve(__dirname, '__fixtures__/ruleset-valid.js');
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
    const results = await run('lint -r ./gh-474/ruleset.js ./gh-474/document.json');

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
    const validNestedRulesetPath = join(__dirname, '__fixtures__/ruleset-extends-valid.js');
    const invalidNestedRulesetPath = join(__dirname, '__fixtures__/ruleset-extends-invalid.js');

    describe('extends feature', () => {
      it('extends a valid relative ruleset', () => {
        return expect(run(`lint ${validCustomOas3SpecPath} -r ${validNestedRulesetPath}`)).resolves.toEqual([]);
      });

      it('fails trying to extend an invalid relative ruleset', () => {
        return expect(run(`lint ${validCustomOas3SpecPath} -r ${invalidNestedRulesetPath}`)).rejects.toThrowError(
          RulesetValidationError,
        );
      });
    });

    describe('when single ruleset option provided', () => {
      it('outputs "does not exist" error', () => {
        return expect(run(`lint ${validOas3SpecPath} -r non-existent-path`)).rejects.toThrow('Cannot find module');
      });

      it('outputs "invalid ruleset" error', () => {
        return expect(run(`lint ${validOas3SpecPath} -r ${invalidRulesetPath}`)).rejects.toThrowError(
          RulesetValidationError,
        );
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
    });

    describe('given legacy ruleset', () => {
      it('outputs warnings', async () => {
        const output = await run(`lint ${validOas3SpecPath} -r ${join(__dirname, '__fixtures__/ruleset.json')}`);
        expect(output).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'info-matches-stoplight' })]));
        expect(output).toEqual(
          expect.not.arrayContaining([
            expect.objectContaining({
              message: 'Info object should contain `contact` object',
            }),
          ]),
        );
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
      return expect(run(`lint -r references/ruleset.js references/no-nested.json`)).resolves.toEqual([
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
      return expect(run(`lint -r references/ruleset.js references/nested.json`)).resolves.toEqual([
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
});
