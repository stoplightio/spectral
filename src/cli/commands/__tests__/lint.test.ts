import { expect as expectOclif, test } from '@oclif/test';

import * as fs from 'fs';
import { resolve } from 'path';

const invalidSpecPath = resolve(__dirname, 'fixtures/openapi-3.0-no-contact.yaml');
const validSpecPath = resolve(__dirname, 'fixtures/openapi-3.0-valid.yaml');

/*
 * These tests currently do not assert stderr because it doesn't seem to be
 * supported like you might expect:
 *   https://github.com/oclif/oclif/issues/142
 */

describe('lint', () => {
  let writeFileSpy: jest.SpyInstance;

  beforeEach(() => {
    writeFileSpy = jest.spyOn(fs, 'writeFile').mockImplementation((source, opts, cb) => cb(null as any));
  });

  afterEach(() => {
    writeFileSpy.mockRestore();
  });

  test
    .command(['lint'])
    .exit(2)
    .it('exits as error with no argument');

  describe('when loading local specification files', () => {
    test
      .stdout()
      .command(['lint', invalidSpecPath])
      .it('outputs warnings in default format', ctx => {
        expectOclif(ctx.stdout).to.contain('Info object should contain `contact` object');
      });

    test
      .stdout()
      .command(['lint', invalidSpecPath, '-f', 'json'])
      .it('outputs warnings in json format', ctx => {
        expectOclif(ctx.stdout).to.contain('"info.contact is not truthy"');
      });

    test
      .stdout()
      .command(['lint', validSpecPath])
      .it('outputs no issues', ctx => {
        expectOclif(ctx.stdout).to.contain('No errors or warnings found!');
      });

    test
      .stdout()
      .command(['lint', invalidSpecPath, '-o', 'results.json'])
      .it('saves results to a file', () => {
        // there are more errors listed
        expect(writeFileSpy).toHaveBeenCalledWith(
          'results.json',
          expect.stringContaining('Info object should contain `contact` object'),
          expect.any(Function) // callback, util.promisify handles it for us
        );
      });
  });

  describe('when loading local specification files', () => {
    test
      .nock('http://foo.local', api =>
        api.get('/openapi').replyWithFile(200, validSpecPath, {
          'Content-Type': 'application/yaml',
        })
      )
      .stdout()
      .command(['lint', 'http://foo.local/openapi'])
      .it('outputs no issues', ctx => {
        expectOclif(ctx.stdout).to.contain('No errors or warnings found!');
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
        expectOclif(ctx.stdout).to.contain('Info object should contain `contact` object');
      });
  });
});
