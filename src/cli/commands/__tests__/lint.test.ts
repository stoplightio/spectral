import { test } from '@oclif/test';
import * as fs from 'fs';
import { resolve } from 'path';
import SpyInstance = jest.SpyInstance;

const invalidSpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-no-contact.yaml');
const validSpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid.yaml');
const validConfigPath = resolve(__dirname, '__fixtures__/config.yml');
const outputConfigPath = resolve(__dirname, '__fixtures__/config.output.yml');
const validCustomSpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid-custom.yaml');
const invalidRulesetPath = resolve(__dirname, '__fixtures__/ruleset-invalid.yaml');
const validRulesetPath = resolve(__dirname, '__fixtures__/ruleset-valid.yaml');
const validNestedRulesetPath = resolve(__dirname, '__fixtures__/ruleset-extends-valid.yaml');
const invalidNestedRulesetPath = resolve(__dirname, '__fixtures__/ruleset-extends-invalid.yaml');
const validRulesetConfigPath = resolve(__dirname, '__fixtures__/config.ruleset.yml');
const invalidRulesetConfigPath = resolve(__dirname, '__fixtures__/config.ruleset.invalid.yml');

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
        .command(['lint', validSpecPath])
        .it('outputs no issues', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });
    });

    describe('and the file is expected to trigger oas3 warnings', () => {
      const args = ['lint', invalidSpecPath];

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
            expect(ctx.stdout).toContain('"info.contact is not truthy"');
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
                expect.any(Function) // callback, util.promisify handles it for us
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
        .command(['lint', validCustomSpecPath, '-r', validNestedRulesetPath])
        .it('should extend a valid relative ruleset', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });

      test
        .stdout()
        .command(['lint', validCustomSpecPath, '-r', invalidNestedRulesetPath])
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
        .command(['lint', validCustomSpecPath, '-r', 'http://foo.local/ruleset-master.yaml'])
        .it('given remote nested ruleset should resolve', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });
    });

    describe('when multiple ruleset options provided', () => {
      test
        .stdout()
        .command(['lint', validSpecPath, '-r', invalidRulesetPath, '-r', validRulesetPath])
        .exit(2)
        .it('given one is valid other is not, outputs "invalid ruleset" error', ctx => {
          expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them 	 should have required property 'given'`);
          expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them 	 should have required property 'then'`);
          expect(ctx.stdout).toContain(`/rules/rule-with-invalid-enum/severity 	 should be number`);
          expect(ctx.stdout).toContain(
            `/rules/rule-with-invalid-enum/severity 	 should be equal to one of the allowed values`
          );
        });

      test
        .stdout()
        .command(['lint', validSpecPath, '-r', invalidRulesetPath, '-r', validRulesetPath])
        .exit(2)
        .it('given one is valid other is not, reads both', ctx => {
          expect(ctx.stdout).toContain(`Reading ruleset ${invalidRulesetPath}`);
          expect(ctx.stdout).toContain(`Reading ruleset ${validRulesetPath}`);
        });
    });

    describe('when single ruleset option provided', () => {
      test
        .stdout()
        .command(['lint', validSpecPath, '-r', 'non-existent-path'])
        .exit(2)
        .it('outputs "does not exist" error');

      test
        .stdout()
        .command(['lint', validSpecPath, '-r', invalidRulesetPath])
        .exit(2)
        .it('outputs "invalid ruleset" error', ctx => {
          expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them 	 should have required property 'given'`);
          expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them 	 should have required property 'then'`);
          expect(ctx.stdout).toContain(`/rules/rule-with-invalid-enum/severity 	 should be number`);
          expect(ctx.stdout).toContain(
            `/rules/rule-with-invalid-enum/severity 	 should be equal to one of the allowed values`
          );
        });

      test
        .stdout()
        .command(['lint', validCustomSpecPath, '-r', validRulesetPath])
        .it('outputs no issues', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });

      test
        .stdout()
        .command(['lint', validSpecPath, '-r', validRulesetPath])
        .it('outputs warnings in default format', ctx => {
          expect(ctx.stdout).toContain('5:10  warning  info-matches-stoplight  Info must contain Stoplight');
          expect(ctx.stdout).not.toContain('Info object should contain `contact` object');
          expect(ctx.stdout).not.toContain('OpenAPI 3.x detected');
        });

      test
        .nock('http://foo.local', api =>
          api.get('/ruleset.yaml').replyWithFile(200, validRulesetPath, {
            'Content-Type': 'application/yaml',
          })
        )
        .stdout()
        .command(['lint', validCustomSpecPath, '-r', 'http://foo.local/ruleset.yaml'])
        .it('given valid remote ruleset file, outputs no issues', ctx => {
          expect(ctx.stdout).toContain('No errors or warnings found!');
        });
    });
  });

  describe('when loading specification files from web', () => {
    test
      .nock('http://foo.local', api =>
        api.get('/openapi').replyWithFile(200, validSpecPath, {
          'Content-Type': 'application/yaml',
        })
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
        api.get('/openapi').replyWithFile(200, invalidSpecPath, {
          'Content-Type': 'application/yaml',
        })
      )
      .stdout()
      .command(['lint', 'http://foo.local/openapi'])
      .it('outputs warnings in default format', ctx => {
        expect(ctx.stdout).toContain('Info object should contain `contact` object');
      });
  });

  describe('when using config file', () => {
    test
      .stdout()
      .command(['lint', invalidSpecPath, '-c', validConfigPath])
      .it('outputs warnings in json format', ctx => {
        expect(ctx.stdout).toContain('"info.contact is not truthy"');
        expect(ctx.stdout).toContain('"info.description is not truthy"');
        expect(ctx.stdout).toContain('"servers does not exist"');
      });

    test
      .stdout()
      .command(['lint', invalidSpecPath, '-c', outputConfigPath])
      .it('saves results to a file', () => {
        expect(fs.writeFile).toHaveBeenCalledWith(
          'results.json',
          // there are more errors listed
          expect.stringContaining('Info object should contain `contact` object'),
          expect.any(Function) // callback, util.promisify handles it for us
        );
      });

    test
      .stdout()
      .command(['lint', validSpecPath, '-c', validRulesetConfigPath])
      .it('outputs invalid ruleset error when invalid ruleset provided', ctx => {
        expect(ctx.stdout).toContain(`5:10  warning  info-matches-stoplight  Info must contain Stoplight`);
      });

    test
      .stdout()
      .command(['lint', validSpecPath, '-c', invalidRulesetConfigPath])
      .exit(2)
      .it('outputs invalid ruleset error when invalid ruleset provided', ctx => {
        expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them 	 should have required property 'given'`);
      });
  });

  describe('when using config file and command args', () => {
    test
      .stdout()
      .command(['lint', invalidSpecPath, '-c', validConfigPath, '--max-results', '1'])
      .it('setting --max-results to 1 will override config value of 5', ctx => {
        expect(ctx.stdout).toContain('"info.contact is not truthy"');
        expect(ctx.stdout).not.toContain('"info.description is not truthy"');
        expect(ctx.stdout).not.toContain('"servers does not exist"');
      });
  });

  describe('when not using config nor default config file', () => {
    test
      .stdout()
      .command(['lint', invalidSpecPath])
      .it('outputs warnings in default format', ctx => {
        expect(ctx.stdout).toContain('3:6  warning  info-contact      Info object should contain `contact` object');
      });
  });

  describe('when using default config file', () => {
    let spy: SpyInstance;
    beforeAll(() => {
      spy = jest.spyOn(process, 'cwd').mockReturnValue(resolve(__dirname, '__fixtures__'));
    });
    afterAll(() => spy.mockClear());

    test
      .stdout()
      .command(['lint', invalidSpecPath])
      .it('outputs data in format from default config file', ctx => {
        expect(ctx.stdout).toContain('"info.contact is not truthy"');
      });
  });
});
