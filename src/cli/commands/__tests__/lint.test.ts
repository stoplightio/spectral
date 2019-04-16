import { test } from '@oclif/test';
import * as fs from 'fs';
import { resolve } from 'path';

const invalidSpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-no-contact.yaml');
const validSpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid.yaml');
const validCustomSpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid-custom.yaml');
const invalidRulesetPath = resolve(__dirname, '__fixtures__/ruleset-invalid.yaml');
const validRulesetPath = resolve(__dirname, '__fixtures__/ruleset-valid.yaml');

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
    test
      .stdout()
      .command(['lint', invalidSpecPath])
      .it('outputs warnings in default format', ctx => {
        expect(ctx.stdout).toContain('Info object should contain `contact` object');
      });

    test
      .stdout()
      .command(['lint', invalidSpecPath, '-f', 'json'])
      .it('outputs warnings in json format', ctx => {
        expect(ctx.stdout).toContain('"info.contact is not truthy"');
      });

    test
      .stdout()
      .command(['lint', validSpecPath])
      .it('outputs no issues', ctx => {
        expect(ctx.stdout).toContain('No errors or warnings found!');
      });

    test
      .stdout()
      .command(['lint', invalidSpecPath, '-o', 'results.json'])
      .it('saves results to a file', () => {
        expect(fs.writeFile).toHaveBeenCalledWith(
          'results.json',
          // there are more errors listed
          expect.stringContaining('Info object should contain `contact` object'),
          expect.any(Function) // callback, util.promisify handles it for us
        );
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
        expect(ctx.stdout).toContain(`2:31  error  given:no-undef             'given' must be defined`);
        expect(ctx.stdout).toContain(`2:31  error  then:no-undef              'then' must be defined`);
        expect(ctx.stdout).toContain(`13:15  error  severity:enum-value-match  'severity' must be one of '0, 1, 2, 3'`);
        expect(ctx.stdout).toContain(
          `14:11  error  type:enum-value-match      'type' must be one of 'validation, style'`
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
      });
  });

  // describe('when multiple rulesets provided', () => {
  //   test
  //     .stdout()
  //     .command(['lint', 'invalidSpecPath2', '-r', 'validRulesetFile', '-r', 'validRulesetFile2'])
  //     .it('outputs warnings in default format');
  // });

  describe('when loading remote specification files', () => {
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
});
