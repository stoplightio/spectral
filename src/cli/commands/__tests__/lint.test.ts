import { test } from '@oclif/test';
import { resolve } from '@stoplight/path';
import * as fs from 'fs';
type SpyInstance = jest.SpyInstance;

const invalidOas3SpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-no-contact.yaml');
const validOas3SpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid.yaml');
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

/*
 * These tests currently do not assert stderr because it doesn't seem to be
 * supported like you might expect:
 *   https://github.com/oclif/oclif/issues/142
 */

jest.mock('fs');

describe('lint', () => {
  test
    .command(['lint'])
    .exit(2)
    .it('exits as error with no argument');

  describe('when loading local specification files', () => {
    describe('and the file is expected to have no warnings', () => {
      test
        .stdout()
        .command(['lint', validCustomOas3SpecPath])
        .it('outputs no issues', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });
    });

    describe('and the file is expected to trigger oas3 warnings', () => {
      const args = ['lint', invalidOas3SpecPath];

      test
        .stdout()
        .command(args)
        .it('outputs warnings in default format', ctx => {
          expect(ctx.stdout).toContain('OpenAPI 3.x detected');
          expect(ctx.stdout).toContain('OpenAPI `servers` must be present and non-empty array');
          expect(ctx.stdout).toContain('Info object should contain `contact` object');
        });

      describe('and -f json is set', () => {
        test
          .stdout()
          .command([...args, '-f', 'json'])
          .it('outputs warnings in json format', ctx => {
            expect(ctx.stdout).toContain('OpenAPI `servers` must be present and non-empty array');
            expect(ctx.stdout).toContain('"Info object should contain `contact` object."');
          });
      });

      describe('and --skip-rule=info-contact is set', () => {
        test
          .stdout()
          .command([...args, '--skip-rule', 'info-contact'])
          .it('output other warnings but not info-contact', ctx => {
            expect(ctx.stdout).toContain('OpenAPI `servers` must be present and non-empty array');
            expect(ctx.stdout).not.toContain('Info object should contain `contact` object');
          });

        describe('and --skip-rule=info-contact --skip-rule=api-servers is set', () => {
          test
            .stdout()
            .command([...args, '--skip-rule', 'info-contact', '--skip-rule', 'api-servers'])
            .it('outputs neither info-contact or api-servers', ctx => {
              expect(ctx.stdout).not.toContain('OpenAPI `servers` must be present and non-empty array');
              expect(ctx.stdout).not.toContain('Info object should contain `contact` object');
            });
        });

        describe('and -o results.json is set', () => {
          test
            .stdout()
            .command([...args, '-o', 'results.json'])
            .it('saves results to a file', () => {
              expect(fs.writeFile).toHaveBeenCalledWith(
                'results.json',
                // there are more errors listed
                expect.stringContaining('Info object should contain `contact` object'),
                expect.any(Function), // callback, util.promisify handles it for us
              );
            });
        });
      });
    });
  });

  describe('--ruleset', () => {
    describe('extends feature', () => {
      test
        .stdout()
        .command(['lint', validCustomOas3SpecPath, '-r', validNestedRulesetPath])
        .it('should extend a valid relative ruleset', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });

      test
        .stdout()
        .command(['lint', validCustomOas3SpecPath, '-r', invalidNestedRulesetPath])
        .exit(2)
        .it('should fail trying to extend an invalid relative ruleset', ctx => {
          expect(ctx.stdout).toContain("should have required property 'given'");
        });

      test
        .nock('http://foo.local', api => {
          api.get('/ruleset-master.yaml').replyWithFile(200, validNestedRulesetPath, {
            'Content-Type': 'application/yaml',
          });

          api.get('/ruleset-valid.yaml').replyWithFile(200, validRulesetPath, {
            'Content-Type': 'application/yaml',
          });
        })
        .stdout()
        .command(['lint', validCustomOas3SpecPath, '-r', 'http://foo.local/ruleset-master.yaml'])
        .it('given remote nested ruleset should resolve', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });
    });

    describe('when multiple ruleset options provided', () => {
      test
        .stdout()
        .command(['lint', validOas3SpecPath, '-r', invalidRulesetPath, '-r', validRulesetPath])
        .exit(2)
        .it('given one is valid other is not, outputs "invalid ruleset" error', ctx => {
          expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'given'`);
          expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'then'`);
          expect(ctx.stdout).toContain(`/rules/rule-with-invalid-enum/severity should be number`);
          expect(ctx.stdout).toContain(
            `/rules/rule-with-invalid-enum/severity should be equal to one of the allowed values`,
          );
        });
    });

    describe('when single ruleset option provided', () => {
      test
        .stdout()
        .command(['lint', validOas3SpecPath, '-r', 'non-existent-path'])
        .exit(2)
        .it('outputs "does not exist" error');

      test
        .stdout()
        .command(['lint', validOas3SpecPath, '-r', invalidRulesetPath])
        .exit(2)
        .it('outputs "invalid ruleset" error', ctx => {
          expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'given'`);
          expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'then'`);
          expect(ctx.stdout).toContain(`/rules/rule-with-invalid-enum/severity should be number`);
          expect(ctx.stdout).toContain(
            `/rules/rule-with-invalid-enum/severity should be equal to one of the allowed values`,
          );
        });

      test
        .stdout()
        .command(['lint', validCustomOas3SpecPath, '-r', validRulesetPath])
        .it('outputs no issues', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });

      test
        .stdout()
        .command(['lint', validOas3SpecPath, '-r', validRulesetPath])
        .it('outputs warnings in default format', ctx => {
          expect(ctx.stdout).toContain('5:10  warning  info-matches-stoplight  Info must contain Stoplight');
          expect(ctx.stdout).not.toContain('Info object should contain `contact` object');
          expect(ctx.stdout).not.toContain('OpenAPI 3.x detected');
        });

      test
        .nock('http://foo.local', api =>
          api.get('/ruleset.yaml').replyWithFile(200, validRulesetPath, {
            'Content-Type': 'application/yaml',
          }),
        )
        .stdout()
        .command(['lint', validCustomOas3SpecPath, '-r', 'http://foo.local/ruleset.yaml'])
        .it('given valid remote ruleset file, outputs no issues', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });
    });

    describe('when a standard oas3 ruleset provided through option', () => {
      test
        .stdout()
        .command(['lint', invalidOas3SpecPath, '-r', standardOas3RulesetPath])
        .it('outputs warnings in default format', ctx => {
          expect(ctx.stdout).toContain(
            '1:5  warning  api-servers       OpenAPI `servers` must be present and non-empty array',
          );
          expect(ctx.stdout).toContain('3:6  warning  info-contact      Info object should contain `contact` object');
          expect(ctx.stdout).toContain(
            '3:6  warning  info-description  OpenAPI object info `description` must be present and non-empty string',
          );
          expect(ctx.stdout).not.toContain('OpenAPI 3.x detected');
        });

      test
        .stdout()
        .command(['lint', oas2PetstoreSpecPath, '-r', standardOas2RulesetPath])
        .it('outputs warnings in default format', ctx => {
          expect(ctx.stdout).toContain(
            '46:24  warning  operation-description   Operation `description` must be present and non-empty string',
          );
          expect(ctx.stdout).toContain('22 problems (0 errors, 22 warnings, 0 infos)');
          expect(ctx.stdout).not.toContain('OpenAPI 2.x detected');
        });
    });
  });

  describe('when --quiet flag is provided', () => {
    test
      .stdout()
      .command(['lint', invalidOas3SpecPath, '--quiet'])
      .it('does not log any additional feedback', ctx => {
        expect(ctx.stdout).not.toContain('OpenAPI 3.x detected');
      });

    test
      .stdout()
      .command(['lint', invalidOas3SpecPath, '--quiet', '--format=json'])
      .it('outputs warnings/errors in a parseable json format', ctx => {
        expect(JSON.parse(ctx.stdout)).toEqual([
          expect.objectContaining({
            message: 'Info object should contain `contact` object.',
            code: 'info-contact',
          }),
          expect.objectContaining({
            code: 'info-description',
            message: 'OpenAPI object info `description` must be present and non-empty string.',
          }),
          expect.objectContaining({
            code: 'api-servers',
            message: 'OpenAPI `servers` must be present and non-empty array.',
          }),
        ]);
      });
  });

  describe('when loading specification files from web', () => {
    test
      .nock('http://foo.local', api =>
        api.get('/openapi').replyWithFile(200, validOas3SpecPath, {
          'Content-Type': 'application/yaml',
        }),
      )
      .stdout()
      .command(['lint', 'http://foo.local/openapi'])
      .it('outputs no issues', ctx => {
        expect(ctx.stdout).toContain('No errors or warnings found!');
      });

    test
      .nock('http://foo.local', api => api.get('/openapi').reply(404))
      .stdout()
      .command(['lint', 'http://foo.local/openapi'])
      .exit(2)
      .it('exits with status 2 if cannot load URI');

    test
      .nock('http://foo.local', api =>
        api.get('/openapi').replyWithFile(200, invalidOas3SpecPath, {
          'Content-Type': 'application/yaml',
        }),
      )
      .stdout()
      .command(['lint', 'http://foo.local/openapi'])
      .it('outputs warnings in default format', ctx => {
        expect(ctx.stdout).toContain('Info object should contain `contact` object');
      });
  });

  describe('when using ruleset file', () => {
    test
      .stdout()
      .command(['lint', invalidOas3SpecPath, '-r', validRulesetPath])
      .it('saves results to a file', () => {
        expect(fs.writeFile).toHaveBeenCalledWith(
          'results.json',
          // there are more errors listed
          expect.stringContaining('Info object should contain `contact` object'),
          expect.any(Function), // callback, util.promisify handles it for us
        );
      });

    test
      .stdout()
      .command(['lint', validOas3SpecPath, '-r', invalidRulesetPath])
      .exit(2)
      .it('outputs invalid ruleset error when invalid ruleset provided', ctx => {
        expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'given'`);
      });
  });

  describe('when not using config nor default config file', () => {
    test
      .stdout()
      .command(['lint', invalidOas3SpecPath])
      .it('outputs warnings in default format', ctx => {
        expect(ctx.stdout).toContain('3:6  warning  info-contact      Info object should contain `contact` object');
      });
  });

  describe('when using default config file', () => {
    let spy: SpyInstance;
    beforeAll(() => {
      spy = jest.spyOn(process, 'cwd').mockReturnValue(resolve(__dirname, '__fixtures__'));
    });
    afterAll(() => spy.mockRestore());

    test
      .stdout()
      .command(['lint', invalidOas3SpecPath])
      .it('respects rules from a ruleset file', ctx => {
        expect(ctx.stdout).toContain(' 5:10  warning  info-matches-stoplight  Info must contain Stoplight');
      });
  });

  describe('ref linting', () => {
    test
      .stdout()
      .command(['lint', draftRefSpec, '-q', '-f=json'])
      .it('outputs errors occurring in referenced files', ctx => {
        expect(JSON.parse(ctx.stdout)).toEqual([
          expect.objectContaining({
            code: 'info-description',
            message: 'OpenAPI object info `description` must be present and non-empty string.',
            path: ['info', 'description'], // todo: relative path or absolute path? there is no such path in linted ref, but there is such in spec when working on resolved file
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
            source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/refs/info.json'),
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
            source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/refs/info.json'),
          }),
          expect.objectContaining({
            code: 'api-schemes',
            message: 'OpenAPI host `schemes` must be present and non-empty array.',
            path: ['schemes'],
            range: expect.any(Object),
            source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/draft-ref.oas2.json'),
          }),
        ]);
      });

    test
      .stdout()
      .command(['lint', draftNestedRefSpec, '-q', '-f=json'])
      .it('outputs errors occurring in nested referenced files', ctx => {
        expect(JSON.parse(ctx.stdout)).toEqual([
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
            source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/refs/contact.json'),
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
            source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/refs/contact.json'),
          }),
          expect.objectContaining({
            code: 'api-schemes',
            message: 'OpenAPI host `schemes` must be present and non-empty array.',
            path: ['schemes'],
            range: expect.any(Object),
            source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/draft-nested-ref.oas2.json'),
          }),
        ]);
      });
  });
});
