import { join, resolve } from '@stoplight/path';
import * as nock from 'nock';
import * as yargs from 'yargs';
import { ValidationError } from '../../../ruleset/validation';
import { ILintConfig } from '../../../types/config';
import lintCommand from '../../commands/lint';
import { lint } from '../linter';
import * as http from 'http';
import * as url from 'url';
import { DEFAULT_REQUEST_OPTIONS } from '../../../request';
import * as ProxyAgent from 'proxy-agent';

jest.mock('../output');

const oas2PetstoreSpecPath = resolve(__dirname, '../../../__tests__/__fixtures__/petstore.oas2.json');
const validCustomOas3SpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid-custom.yaml');
const invalidRulesetPath = resolve(__dirname, '__fixtures__/ruleset-invalid.yaml');
const validRulesetPath = resolve(__dirname, '__fixtures__/ruleset-valid.yaml');
const validNestedRulesetPath = resolve(__dirname, '__fixtures__/ruleset-extends-valid.yaml');
const invalidNestedRulesetPath = resolve(__dirname, '__fixtures__/ruleset-extends-invalid.yaml');
const standardOasRulesetPath = resolve(__dirname, '../../../../rulesets/oas/index.json');
const draftRefSpec = resolve(__dirname, './__fixtures__/draft-ref.oas2.json');
const draftNestedRefSpec = resolve(__dirname, './__fixtures__/draft-nested-ref.oas2.json');
const validOas3SpecPath = resolve(__dirname, './__fixtures__/openapi-3.0-valid.yaml');
const invalidOas3SpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-no-contact.yaml');
const fooResolver = resolve(__dirname, '__fixtures__/foo-resolver.js');
const fooDocument = resolve(__dirname, '__fixtures__/foo-document.yaml');

function run(command: string) {
  const parser = yargs.command(lintCommand);
  const { documents, ...opts } = (parser.parse(command) as unknown) as ILintConfig & { documents: string[] };
  return lint(documents, opts);
}

describe('Linter service', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log');
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
          path: ['info', 'contact', 'name'],
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
            expect.objectContaining({ code: 'oas3-api-servers' }),
            expect.objectContaining({ code: 'info-contact' }),
          ]),
        );
      });

      describe('and --skip-rule=info-contact is set', () => {
        it('output other warnings but not info-contact', async () => {
          const output = await run(`lint --skip-rule=info-contact ${document}`);

          expect(output).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'oas3-api-servers' })]));
          expect(output).toEqual(expect.not.arrayContaining([expect.objectContaining({ code: 'info-contact' })]));
        });
      });

      describe('and --skip-rule=info-contact --skip-rule=oas3-api-servers is set', () => {
        it('outputs neither info-contact or oas3-api-servers', async () => {
          const output = await run(`lint --skip-rule=info-contact --skip-rule=oas3-api-servers ${document}`);

          expect(output).toEqual(expect.not.arrayContaining([expect.objectContaining({ code: 'info-contact' })]));
          expect(output).toEqual(expect.not.arrayContaining([expect.objectContaining({ code: 'oas3-api-servers' })]));
        });
      });
    });
  });

  describe('when a list of files is provided', () => {
    // cwd is set to root of Spectral
    const documents = [
      join(process.cwd(), `src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json`),
      join(process.cwd(), `src/__tests__/__fixtures__/petstore.oas3.json`),
    ];

    it('outputs issues for each file', () => {
      return expect(run(['lint', ...documents].join(' '))).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'invalid-ref',
            path: ['paths', '/pets', 'get', 'responses', '200', 'content', 'application/json', 'schema', '$ref'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'invalid-ref',
            path: ['paths', '/pets', 'get', 'responses', 'default', 'content', 'application/json', 'schema', '$ref'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'oas3-valid-schema-example',
            path: ['components', 'schemas', 'foo', 'example'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'info-contact',
            path: ['info'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
          expect.objectContaining({
            code: 'info-description',
            path: ['info'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pets', 'get'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pets', 'post'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pets/{petId}', 'get'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
        ]),
      );
    });
  });

  describe('when glob is provided', () => {
    // cwd is set to root of Spectral
    const documents = `src/__tests__/__fixtures__/petstore*.json`;

    it('outputs issues for each file', () => {
      return expect(run(`lint ${documents}`)).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'invalid-ref',
            path: ['paths', '/pets', 'get', 'responses', '200', 'content', 'application/json', 'schema', '$ref'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'invalid-ref',
            path: ['paths', '/pets', 'get', 'responses', 'default', 'content', 'application/json', 'schema', '$ref'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'oas3-valid-schema-example',
            path: ['components', 'schemas', 'foo', 'example'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'oas3-schema',
            path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/pet', 'post', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/pet', 'put', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/pet/{petId}', 'post', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/pet/{petId}', 'delete', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/store/order/{orderId}', 'delete', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/user', 'post', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/user/createWithArray', 'post', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/user/createWithList', 'post', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/user/logout', 'get', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/user/{username}', 'put', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            path: ['paths', '/user/{username}', 'delete', 'responses'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pet', 'post', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pet', 'put', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pet/{petId}', 'post', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pet/{petId}', 'delete', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pet/{petId}/uploadImage', 'post', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/store/order', 'post', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/user/createWithArray', 'post', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/user/createWithList', 'post', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/user/login', 'get', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/user/logout', 'get', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/user/{username}', 'get', 'description'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas2.json'),
          }),
          expect.objectContaining({
            code: 'info-contact',
            path: ['info'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
          expect.objectContaining({
            code: 'info-description',
            path: ['info'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pets', 'get'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pets', 'post'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
          expect.objectContaining({
            code: 'operation-description',
            path: ['paths', '/pets/{petId}', 'get'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.oas3.json'),
          }),
        ]),
      );
    });

    it('unixifies patterns', () => {
      return expect(run(`lint src\\__tests__\\__fixtures__\\petstore.invalid-schema.*.json`)).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'invalid-ref',
            path: ['paths', '/pets', 'get', 'responses', '200', 'content', 'application/json', 'schema', '$ref'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'invalid-ref',
            path: ['paths', '/pets', 'get', 'responses', 'default', 'content', 'application/json', 'schema', '$ref'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'invalid-ref',
            path: ['paths', '/pets', 'get', 'responses', 'default', 'content', 'application/json', 'schema', '$ref'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'oas3-valid-schema-example',
            path: ['components', 'schemas', 'foo', 'example'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'oas3-unused-component',
            path: ['components', 'schemas', 'Pets'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
          expect.objectContaining({
            code: 'oas3-schema',
            path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
            source: join(process.cwd(), 'src/__tests__/__fixtures__/petstore.invalid-schema.oas3.json'),
          }),
        ]),
      );
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

      describe('when a standard oas3 ruleset provided through option', () => {
        it('outputs warnings', () => {
          return expect(run(`lint ${invalidOas3SpecPath} -r ${standardOasRulesetPath}`)).resolves.toEqual(
            expect.arrayContaining([
              expect.objectContaining({ code: 'oas3-api-servers' }),
              expect.objectContaining({ code: 'info-contact' }),
              expect.objectContaining({ code: 'info-description' }),
            ]),
          );
        });
      });

      describe('when a standard oas2 ruleset provided through option', () => {
        it('outputs warnings', async () => {
          const output = await run(`lint ${oas2PetstoreSpecPath} -r ${standardOasRulesetPath}`);
          expect(output).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'operation-description' })]));
          expect(output).toHaveLength(22);
        });
      });
    });
  });

  describe('when loading specification files from web', () => {
    it('outputs no issues', () => {
      nock('http://foo.local').persist().get('/openapi').replyWithFile(200, validOas3SpecPath, {
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
      nock('http://foo.local').persist().get('/openapi').replyWithFile(200, invalidOas3SpecPath, {
        'Content-Type': 'application/yaml',
      });

      return expect(run('lint http://foo.local/openapi')).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'Info object should contain `contact` object.',
          }),
        ]),
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
          code: 'oas2-api-schemes',
          message: 'OpenAPI host `schemes` must be present and non-empty array.',
          path: [],
          range: expect.any(Object),
          source: expect.stringContaining('__tests__/__fixtures__/draft-ref.oas2.json'),
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          message: 'Property `foo` is not expected to be here.',
          path: ['paths', 'foo'],
          range: {
            end: {
              character: 13,
              line: 8,
            },
            start: {
              character: 10,
              line: 8,
            },
          },
          source: expect.stringContaining('__tests__/__fixtures__/draft-ref.oas2.json'),
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          message: '`info` property should have required property `title`.',
          path: ['definitions', 'info'],
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
          source: expect.stringContaining('/__tests__/__fixtures__/refs/info.json'),
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          message: 'Property `foo` is not expected to be here.',
          path: ['definitions', 'info', 'foo'],
          range: {
            end: {
              character: 18,
              line: 4,
            },
            start: {
              character: 13,
              line: 4,
            },
          },
          source: expect.stringContaining('/__tests__/__fixtures__/refs/info.json'),
        }),
        expect.objectContaining({
          code: 'info-description',
          message: 'OpenAPI object info `description` must be present and non-empty string.',
          path: ['definitions', 'info', 'description'],
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
        expect.objectContaining({
          code: 'oas2-schema',
          message: '`description` property type should be string.',
          path: ['definitions', 'info', 'description'],
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
          code: 'oas2-api-schemes',
          message: 'OpenAPI host `schemes` must be present and non-empty array.',
          path: [],
          range: expect.any(Object),
          source: expect.stringContaining('__tests__/__fixtures__/draft-nested-ref.oas2.json'),
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          message: '`info` property should have required property `title`.',
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/contact.json'),
        }),
        expect.objectContaining({
          code: 'info-description',
          message: 'OpenAPI object info `description` must be present and non-empty string.',
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/contact.json'),
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          message: '`description` property type should be string.', // this is covered by 'info-description' as well
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/contact.json'),
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          message: '`get` property should have required property `responses`.',
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/paths.json'),
        }),
        expect.objectContaining({
          code: 'operation-description',
          message: 'Operation `description` must be present and non-empty string.',
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/paths.json'),
        }),
        expect.objectContaining({
          code: 'operation-operationId',
          message: 'Operation should have an `operationId`.',
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/paths.json'),
        }),
        expect.objectContaining({
          code: 'operation-tags',
          message: 'Operation should have non-empty `tags` array.',
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/paths.json'),
        }),
        expect.objectContaining({
          code: 'oas2-schema',
          message: 'Property `response` is not expected to be here.',
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
          source: expect.stringContaining('__tests__/__fixtures__/refs/paths.json'),
        }),
      ]);
    });
  });

  describe('--resolver', () => {
    it('uses provided resolver for $ref resolving', async () => {
      expect(await run(`lint --resolver ${fooResolver} ${fooDocument}`)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'info-contact',
            source: 'foo://openapi-3.0-no-contact.yaml',
          }),
          expect.objectContaining({
            code: 'info-description',
            source: 'foo://openapi-3.0-no-contact.yaml',
          }),
          expect.objectContaining({
            code: 'oas3-api-servers',
            source: 'foo://openapi-3.0-no-contact.yaml',
          }),
        ]),
      );
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
