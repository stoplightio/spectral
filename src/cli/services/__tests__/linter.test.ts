import { Cache, Resolver } from '@stoplight/json-ref-resolver';
import { ICache } from '@stoplight/json-ref-resolver/types';
import { resolve } from '@stoplight/path';
import * as nock from 'nock';
import * as yargs from 'yargs';
import { httpAndFileResolver } from '../../../resolvers/http-and-file';
import { ValidationError } from '../../../rulesets/validation';
import { ILintConfig } from '../../../types/config';
import lintCommand from '../../commands/lint';
import { lint } from '../linter';

jest.mock('../output');

const oas2PetstoreSpecPath = resolve(__dirname, '../../../__tests__/__fixtures__/petstore.oas2.json');
const validCustomOas3SpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid-custom.yaml');
const invalidRulesetPath = resolve(__dirname, '__fixtures__/ruleset-invalid.yaml');
const validRulesetPath = resolve(__dirname, '__fixtures__/ruleset-valid.yaml');
const validNestedRulesetPath = resolve(__dirname, '__fixtures__/ruleset-extends-valid.yaml');
const invalidNestedRulesetPath = resolve(__dirname, '__fixtures__/ruleset-extends-invalid.yaml');
const standardOas3RulesetPath = resolve(__dirname, '../../../rulesets/oas3/index.json');
const standardOas2RulesetPath = resolve(__dirname, '../../../rulesets/oas2/index.json');
const draftRefSpec = resolve(__dirname, './__fixtures__/draft-ref.oas2.json');
const draftNestedRefSpec = resolve(__dirname, './__fixtures__/draft-nested-ref.oas2.json');
const validOas3SpecPath = resolve(__dirname, './__fixtures__/openapi-3.0-valid.yaml');
const invalidOas3SpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-no-contact.yaml');

function run(command: string) {
  const parser = yargs.command(lintCommand);
  const { document, ruleset, ...opts } = (parser.parse(command) as unknown) as ILintConfig & { document: string };
  return lint(document, opts, ruleset);
}

describe('Linter service', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log');
    (httpAndFileResolver as Omit<Resolver, 'uriCache'> & { uriCache: ICache }).uriCache = new Cache();
  });

  afterEach(() => {
    logSpy.mockRestore();

    nock.cleanAll();
  });

  it('handles relative path to a document', async () => {
    const results = await run('lint src/__tests__/__fixtures__/gh-474/spec.yaml');
    expect(results).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          code: 'invalid-ref',
        }),
      ]),
    );

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'oas3-schema',
          range: {
            end: {
              character: 14,
              line: 5,
            },
            start: {
              character: 10,
              line: 5,
            },
          },
          source: expect.stringContaining('/__tests__/__fixtures__/gh-474/common.yaml'),
        }),
      ]),
    );
  });

  it('handles relative path to a document #2', async () => {
    const results = await run('lint src/__tests__/__fixtures__/gh-474/spec-2.yaml');

    expect(results).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          code: 'invalid-ref',
        }),
      ]),
    );

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'oas3-schema',
          range: {
            end: {
              character: 14,
              line: 5,
            },
            start: {
              character: 10,
              line: 5,
            },
          },
          source: expect.stringContaining('/__tests__/__fixtures__/gh-474/common.yaml'),
        }),
      ]),
    );
  });

  describe('when document is local file', () => {
    describe('and the file is expected to have no warnings', () => {
      const document = resolve(__dirname, '__fixtures__/openapi-3.0-valid.yaml');

      it('outputs no issues', () => {
        return expect(run(`lint ${document}`)).resolves.toEqual([]);
      });
    });

    describe('and the file is expected to trigger oas3 warnings', () => {
      const document = resolve(__dirname, '__fixtures__/openapi-3.0-no-contact.yaml');

      it('outputs warnings', async () => {
        const output = await run(`lint ${document}`);
        expect(logSpy).toHaveBeenCalledWith('OpenAPI 3.x detected');
        expect(output).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ code: 'api-servers' }),
            expect.objectContaining({ code: 'info-contact' }),
          ]),
        );
      });

      describe('and --skip-rule=info-contact is set', () => {
        it('output other warnings but not info-contact', async () => {
          const output = await run(`lint --skip-rule=info-contact ${document}`);

          expect(output).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'api-servers' })]));
          expect(output).toEqual(expect.not.arrayContaining([expect.objectContaining({ code: 'info-contact' })]));
        });
      });

      describe('and --skip-rule=info-contact --skip-rule=api-servers is set', () => {
        it('outputs neither info-contact or api-servers', async () => {
          const output = await run(`lint --skip-rule=info-contact --skip-rule=api-servers ${document}`);

          expect(output).toEqual(expect.not.arrayContaining([expect.objectContaining({ code: 'info-contact' })]));
          expect(output).toEqual(expect.not.arrayContaining([expect.objectContaining({ code: 'api-servers' })]));
        });
      });
    });
  });

  describe('--ruleset', () => {
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
            expect.objectContaining({ message: 'Info object should contain `contact` object' }),
          ]),
        );
      });

      it('given valid remote ruleset file, outputs no issues', () => {
        nock('http://foo.local')
          .persist()
          .get('/ruleset.yaml')
          .replyWithFile(200, validRulesetPath, {
            'Content-Type': 'application/yaml',
          });

        return expect(run(`lint ${validCustomOas3SpecPath} -r http://foo.local/ruleset.yaml`)).resolves.toEqual([]);
      });

      describe('when a standard oas3 ruleset provided through option', () => {
        it('outputs warnings', () => {
          return expect(run(`lint ${invalidOas3SpecPath} -r ${standardOas3RulesetPath}`)).resolves.toEqual(
            expect.arrayContaining([
              expect.objectContaining({ code: 'api-servers' }),
              expect.objectContaining({ code: 'info-contact' }),
              expect.objectContaining({ code: 'info-description' }),
            ]),
          );
        });
      });

      describe('when a standard oas2 ruleset provided through option', () => {
        it('outputs warnings', async () => {
          const output = await run(`lint ${oas2PetstoreSpecPath} -r ${standardOas2RulesetPath}`);
          expect(output).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'operation-description' })]));
          expect(output).toHaveLength(22);
        });
      });
    });
  });

  describe('when loading specification files from web', () => {
    it('outputs no issues', () => {
      nock('http://foo.local')
        .persist()
        .get('/openapi')
        .replyWithFile(200, validOas3SpecPath, {
          'Content-Type': 'application/yaml',
        });

      return expect(run('lint http://foo.local/openapi')).resolves.toEqual([]);
    });

    it('throws if cannot load URI', () => {
      nock('http://foo.local')
        .persist()
        .get('/openapi')
        .reply(404);

      return expect(run('lint http://foo.local/openapi')).rejects.toThrow(
        'Could not parse http://foo.local/openapi: Not Found',
      );
    });

    it('outputs warnings', () => {
      nock('http://foo.local')
        .persist()
        .get('/openapi')
        .replyWithFile(200, invalidOas3SpecPath, {
          'Content-Type': 'application/yaml',
        });

      return expect(run('lint http://foo.local/openapi')).resolves.toEqual(
        expect.arrayContaining([expect.objectContaining({ message: 'Info object should contain `contact` object.' })]),
      );
    });
  });

  describe('when using default ruleset file', () => {
    let spy: jest.SpyInstance;
    beforeAll(() => {
      spy = jest.spyOn(process, 'cwd').mockReturnValue(resolve(__dirname, '__fixtures__'));
    });
    afterAll(() => spy.mockRestore());

    it('respects rules from a ruleset file', () => {
      return expect(run(`lint ${invalidOas3SpecPath}`)).resolves.toEqual([
        expect.objectContaining({
          code: 'info-matches-stoplight',
          message: 'Info must contain Stoplight',
        }),
      ]);
    });
  });

  describe('$ref linting', () => {
    it('outputs errors occurring in referenced files', () => {
      return expect(run(`lint ${draftRefSpec}`)).resolves.toEqual([
        expect.objectContaining({
          code: 'api-schemes',
          message: 'OpenAPI host `schemes` must be present and non-empty array.',
          path: [],
          range: expect.any(Object),
          source: expect.stringContaining('__tests__/__fixtures__/draft-ref.oas2.json'),
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          message: '/info Property foo is not expected to be here',
          path: ['info'],
          range: {
            end: {
              character: 5,
              line: 9,
            },
            start: {
              character: 12,
              line: 3,
            },
          },
          source: expect.stringContaining('__tests__/__fixtures__/refs/info.json'),
        }),
        expect.objectContaining({
          code: 'info-description',
          message: 'OpenAPI object info `description` must be present and non-empty string.',
          path: ['info', 'description'], // todo: relative path or absolute path? there is no such path in linted file, but there is such in spec when working on resolved file
          range: {
            end: {
              character: 22,
              line: 5,
            },
            start: {
              character: 21,
              line: 5,
            },
          },
          source: expect.stringContaining('__tests__/__fixtures__/refs/info.json'),
        }),
      ]);
    });

    it('outputs errors occurring in nested referenced files', () => {
      return expect(run(`lint ${draftNestedRefSpec}`)).resolves.toEqual([
        expect.objectContaining({
          code: 'api-schemes',
          message: 'OpenAPI host `schemes` must be present and non-empty array.',
          path: [],
          range: expect.any(Object),
          source: expect.stringContaining('__tests__/__fixtures__/draft-nested-ref.oas2.json'),
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          message: "/info should have required property 'title'",
          path: ['info'],
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/contact.json'),
        }),
        expect.objectContaining({
          code: 'info-description',
          message: 'OpenAPI object info `description` must be present and non-empty string.',
          path: ['info', 'description'],
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/contact.json'),
        }),
      ]);
    });
  });
});
