import { resolve } from '@stoplight/path';
// import * as fs from 'fs';
import * as yargs from 'yargs';

import lintCommand from '../lint';

// TODO Move these into relevant contexts, and if there are no shared contexts rejig tests to make them
// const oas2PetstoreSpecPath = resolve(__dirname, '../../../__tests__/__fixtures__/petstore.oas2.json');
// const validCustomOas3SpecPath = resolve(__dirname, '__fixtures__/openapi-3.0-valid-custom.yaml');
// const invalidRulesetPath = resolve(__dirname, '__fixtures__/ruleset-invalid.yaml');
// const validRulesetPath = resolve(__dirname, '__fixtures__/ruleset-valid.yaml');
// const validNestedRulesetPath = resolve(__dirname, '__fixtures__/ruleset-extends-valid.yaml');
// const invalidNestedRulesetPath = resolve(__dirname, '__fixtures__/ruleset-extends-invalid.yaml');
// const standardOas3RulesetPath = resolve(__dirname, '../../../rulesets/oas3/index.json');
// const standardOas2RulesetPath = resolve(__dirname, '../../../rulesets/oas2/index.json');
// const draftRefSpec = resolve(__dirname, './__fixtures__/draft-ref.oas2.json');
// const draftNestedRefSpec = resolve(__dirname, './__fixtures__/draft-nested-ref.oas2.json');

function run(command: string | string[]) {
  const parser = yargs.command(lintCommand);
  return new Promise(done => {
    parser.parse(command, (_err: Error, commandPromise: Promise<unknown>) => commandPromise.then(done));
  });
}

describe('lint', () => {
  it('shows help when no document argument is passed', async () => {
    const output = await run('lint');
    expect(output).toContain('document  Location of a JSON/YAML document');
  });

  it('should handle relative path to a document', async () => {
    const output = await run(['lint', 'src/__tests__/__fixtures__/gh-474/spec.yaml']);
    expect(output).not.toContain('invalid-ref');
    expect(output).toContain(`/__tests__/__fixtures__/gh-474/common.yaml
 6:11  error  oas3-schema  type should be string`);
  });

  it('should handle relative path to a document #2', async () => {
    const output = await run(['lint', 'src/__tests__/__fixtures__/gh-474/spec-2.yaml']);
    expect(output).not.toContain('invalid-ref');
    expect(output).toContain(`/__tests__/__fixtures__/gh-474/common.yaml
 6:11  error  oas3-schema  type should be string`);
  });

  describe('when document is local file', () => {
    describe('and the file is expected to have no warnings', () => {
      const document = resolve(__dirname, '__fixtures__/openapi-3.0-valid.yaml');

      it('outputs no issues', async () => {
        const output = await run(['lint', document]);
        expect(output).toContain('No errors or warnings found!');
      });
    });

    describe('and the file is expected to trigger oas3 warnings', () => {
      const document = resolve(__dirname, '__fixtures__/openapi-3.0-no-contact.yaml');

      it('outputs warnings in default format', async () => {
        const output = await run(['lint', document]);
        expect(output).toContain('OpenAPI 3.x detected');
        expect(output).toContain('OpenAPI `servers` must be present and non-empty array');
        expect(output).toContain('Info object should contain `contact` object');
      });
    });

    //     describe('and -f json is set', () => {
    //       it('outputs warnings in json format', ctx => {
    //         command([...args, '-f', 'json'])
    //         expect(ctx.stdout).toContain('OpenAPI `servers` must be present and non-empty array');
    //         expect(ctx.stdout).toContain('"Info object should contain `contact` object."');
    //       });
    //     });

    //     describe('and --skip-rule=info-contact is set', () => {
    //       it('output other warnings but not info-contact', ctx => {
    //         command([...args, '--skip-rule', 'info-contact'])
    //         expect(ctx.stdout).toContain('OpenAPI `servers` must be present and non-empty array');
    //         expect(ctx.stdout).not.toContain('Info object should contain `contact` object');
    //       });

    //       describe('and --skip-rule=info-contact --skip-rule=api-servers is set', () => {
    //         it('outputs neither info-contact or api-servers', ctx => {
    //           command([...args, '--skip-rule', 'info-contact', '--skip-rule', 'api-servers'])
    //           expect(ctx.stdout).not.toContain('OpenAPI `servers` must be present and non-empty array');
    //           expect(ctx.stdout).not.toContain('Info object should contain `contact` object');
    //         });
    //       });

    //       describe('and -o results.json is set', () => {
    //         it('saves results to a file', () => {
    //           command([...args, '-o', 'results.json'])
    //           expect(fs.writeFile).toHaveBeenCalledWith(
    //             'results.json',
    //             // there are more errors listed
    //             expect.stringContaining('Info object should contain `contact` object'),
    //             expect.any(Function), // callback, util.promisify handles it for us
    //           );
    //         });
    //       });
    //     });
    //   });
    // });

    // describe('--ruleset', () => {
    //   describe('extends feature', () => {
    //     it('should extend a valid relative ruleset', ctx => {
    //       command(['lint', validCustomOas3SpecPath, '-r', validNestedRulesetPath])
    //       expect(ctx.stdout).toContain('No errors or warnings found!');
    //     });

    //     it('should fail trying to extend an invalid relative ruleset', ctx => {
    //       command(['lint', validCustomOas3SpecPath, '-r', invalidNestedRulesetPath])
    //       exit(2)
    //       expect(ctx.stdout).toContain("should have required property 'given'");
    //     });

    //     it('given remote nested ruleset should resolve', ctx => {
    //       nock('http://foo.local', api => {
    //         api.get('/ruleset-master.yaml').replyWithFile(200, validNestedRulesetPath, {
    //           'Content-Type': 'application/yaml',
    //         });

    //         api.get('/ruleset-valid.yaml').replyWithFile(200, validRulesetPath, {
    //           'Content-Type': 'application/yaml',
    //         });
    //       })
    //       command(['lint', validCustomOas3SpecPath, '-r', 'http://foo.local/ruleset-master.yaml'])
    //       expect(ctx.stdout).toContain('No errors or warnings found!');
    //     });
    //   });

    //   describe('when multiple ruleset options provided', () => {
    //     it('given one is valid other is not, outputs "invalid ruleset" error', ctx => {
    //       command(['lint', validOas3SpecPath, '-r', invalidRulesetPath, '-r', validRulesetPath])
    //       exit(2)
    //       expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'given'`);
    //       expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'then'`);
    //       expect(ctx.stdout).toContain(`/rules/rule-with-invalid-enum/severity should be number`);
    //       expect(ctx.stdout).toContain(
    //         `/rules/rule-with-invalid-enum/severity should be equal to one of the allowed values`,
    //       );
    //     });
    //   });

    //   describe('when single ruleset option provided', () => {
    //     it('outputs "does not exist" error', () => {
    //       command(['lint', validOas3SpecPath, '-r', 'non-existent-path'])
    //       exit(2)
    //     });

    //     it('outputs "invalid ruleset" error', ctx => {
    //       command(['lint', validOas3SpecPath, '-r', invalidRulesetPath])
    //       .exit(2)
    //       expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'given'`);
    //       expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'then'`);
    //       expect(ctx.stdout).toContain(`/rules/rule-with-invalid-enum/severity should be number`);
    //       expect(ctx.stdout).toContain(
    //         `/rules/rule-with-invalid-enum/severity should be equal to one of the allowed values`,
    //       );
    //     });

    //     it('outputs no issues', ctx => {
    //       command(['lint', validCustomOas3SpecPath, '-r', validRulesetPath])
    //       expect(ctx.stdout).toContain('No errors or warnings found!');
    //     });

    //     it('outputs warnings in default format', ctx => {
    //       command(['lint', validOas3SpecPath, '-r', validRulesetPath])
    //       expect(ctx.stdout).toContain('5:10  warning  info-matches-stoplight  Info must contain Stoplight');
    //       expect(ctx.stdout).not.toContain('Info object should contain `contact` object');
    //       expect(ctx.stdout).toContain('OpenAPI 3.x detected');
    //     });

    //     it('given valid remote ruleset file, outputs no issues', ctx => {
    //       nock('http://foo.local', api =>
    //         api.get('/ruleset.yaml').replyWithFile(200, validRulesetPath, {
    //           'Content-Type': 'application/yaml',
    //         }),
    //       )
    //       command(['lint', validCustomOas3SpecPath, '-r', 'http://foo.local/ruleset.yaml'])
    //       expect(ctx.stdout).toContain('No errors or warnings found!');
    //   });

    //   describe('when a standard oas3 ruleset provided through option', () => {
    //     it('outputs warnings in default format', ctx => {
    //       command(['lint', invalidOas3SpecPath, '-r', standardOas3RulesetPath])
    //       expect(ctx.stdout).toContain(
    //         '1:1  warning  api-servers       OpenAPI `servers` must be present and non-empty array',
    //       );
    //       expect(ctx.stdout).toContain('3:6  warning  info-contact      Info object should contain `contact` object');
    //       expect(ctx.stdout).toContain(
    //         '3:6  warning  info-description  OpenAPI object info `description` must be present and non-empty string',
    //       );
    //       expect(ctx.stdout).toContain('OpenAPI 3.x detected');
    //     });

    //     it('outputs warnings in default format', ctx => {
    //       command(['lint', oas2PetstoreSpecPath, '-r', standardOas2RulesetPath])
    //       expect(ctx.stdout).toContain(
    //         '46:24  warning  operation-description   Operation `description` must be present and non-empty string',
    //       );
    //       expect(ctx.stdout).toContain('28 problems (0 errors, 28 warnings, 0 infos)');
    //       expect(ctx.stdout).toContain('OpenAPI 2.0 (Swagger) detected');
    //     });
    //   });
    // });

    // describe('when --quiet flag is provided', () => {
    //   it('does not log any additional feedback', ctx => {
    //     command(['lint', invalidOas3SpecPath, '--quiet'])
    //     expect(ctx.stdout).not.toContain('OpenAPI 3.x detected');
    //   });

    //   it('outputs warnings/errors in a parseable json format', ctx => {
    //     command(['lint', invalidOas3SpecPath, '--quiet', '--format=json'])
    //     expect(JSON.parse(ctx.stdout)).toEqual([
    //       expect.objectContaining({
    //         message: 'Info object should contain `contact` object.',
    //         code: 'info-contact',
    //       }),
    //       expect.objectContaining({
    //         code: 'info-description',
    //         message: 'OpenAPI object info `description` must be present and non-empty string.',
    //       }),
    //       expect.objectContaining({
    //         code: 'api-servers',
    //         message: 'OpenAPI `servers` must be present and non-empty array.',
    //       }),
    //     ]);
    //   });
    // });

    // describe('when loading specification files from web', () => {
    //   it('outputs no issues', ctx => {
    //     nock('http://foo.local', api =>
    //       api.get('/openapi').replyWithFile(200, validOas3SpecPath, {
    //         'Content-Type': 'application/yaml',
    //       }),
    //     )
    //     command(['lint', 'http://foo.local/openapi'])
    //     expect(ctx.stdout).toContain('No errors or warnings found!');
    //   });

    //   it('exits with status 2 if cannot load URI', () => {
    //     .nock('http://foo.local', api => api.get('/openapi').reply(404))
    //     command(['lint', 'http://foo.local/openapi'])
    //     .exit(2)
    //   });

    //   it('outputs warnings in default format', ctx => {
    //     nock('http://foo.local', api =>
    //       api.get('/openapi').replyWithFile(200, invalidOas3SpecPath, {
    //         'Content-Type': 'application/yaml',
    //       }),
    //     )
    //     command(['lint', 'http://foo.local/openapi'])
    //     expect(ctx.stdout).toContain('Info object should contain `contact` object');
    //   });
    // });

    // describe('when using ruleset file', () => {
    //   it('saves results to a file', () => {
    //     command(['lint', invalidOas3SpecPath, '-r', validRulesetPath])
    //     expect(fs.writeFile).toHaveBeenCalledWith(
    //       'results.json',
    //       // there are more errors listed
    //       expect.stringContaining('Info object should contain `contact` object'),
    //       expect.any(Function), // callback, util.promisify handles it for us
    //     );
    //   });

    //   it('outputs invalid ruleset error when invalid ruleset provided', ctx => {
    //     command(['lint', validOas3SpecPath, '-r', invalidRulesetPath])
    //     .exit(2)
    //     expect(ctx.stdout).toContain(`/rules/rule-without-given-nor-them should have required property 'given'`);
    //   });
    // });

    // describe('when not using ruleset nor default ruleset file', () => {
    //   it('outputs warnings in default format', ctx => {
    //     command(['lint', invalidOas3SpecPath])
    //     expect(ctx.stdout).toContain('3:6  warning  info-contact      Info object should contain `contact` object');
    //   });
    // });

    // describe('when using default ruleset file', () => {
    //   let spy: jest.SpyInstance;
    //   beforeAll(() => {
    //     spy = jest.spyOn(process, 'cwd').mockReturnValue(resolve(__dirname, '__fixtures__'));
    //   });
    //   afterAll(() => spy.mockRestore());

    //   it('respects rules from a ruleset file', ctx => {
    //     command(['lint', invalidOas3SpecPath])
    //     expect(ctx.stdout).toContain(' 5:10  warning  info-matches-stoplight  Info must contain Stoplight');
    //   });
    // });

    // describe('ref linting', () => {
    //   it('outputs errors occurring in referenced files', ctx => {
    //     command(['lint', draftRefSpec, '-q', '-f=json'])
    //     expect(JSON.parse(ctx.stdout)).toEqual([
    //       expect.objectContaining({
    //         code: 'info-description',
    //         message: 'OpenAPI object info `description` must be present and non-empty string.',
    //         path: ['info', 'description'], // todo: relative path or absolute path? there is no such path in linted file, but there is such in spec when working on resolved file
    //         range: {
    //           end: {
    //             character: 22,
    //             line: 5,
    //           },
    //           start: {
    //             character: 21,
    //             line: 5,
    //           },
    //         },
    //         source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/refs/info.json'),
    //       }),
    //       expect.objectContaining({
    //         code: 'api-schemes',
    //         message: 'OpenAPI host `schemes` must be present and non-empty array.',
    //         path: [],
    //         range: expect.any(Object),
    //         source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/draft-ref.oas2.json'),
    //       }),
    //       expect.objectContaining({
    //         code: 'oas2-schema',
    //         message: '/info Property foo is not expected to be here',
    //         path: ['info'],
    //         range: {
    //           end: {
    //             character: 5,
    //             line: 9,
    //           },
    //           start: {
    //             character: 12,
    //             line: 3,
    //           },
    //         },
    //         source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/refs/info.json'),
    //       }),
    //     ]);
    //   });

    //   it('outputs errors occurring in nested referenced files', ctx => {
    //     command(['lint', draftNestedRefSpec, '-q', '-f=json'])
    //     expect(JSON.parse(ctx.stdout)).toEqual([
    //       expect.objectContaining({
    //         code: 'info-description',
    //         message: 'OpenAPI object info `description` must be present and non-empty string.',
    //         path: ['info', 'description'],
    //         range: {
    //           end: {
    //             character: 18,
    //             line: 2,
    //           },
    //           start: {
    //             character: 17,
    //             line: 2,
    //           },
    //         },
    //         source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/refs/contact.json'),
    //       }),
    //       expect.objectContaining({
    //         code: 'api-schemes',
    //         message: 'OpenAPI host `schemes` must be present and non-empty array.',
    //         path: [],
    //         range: expect.any(Object),
    //         source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/draft-nested-ref.oas2.json'),
    //       }),
    //       expect.objectContaining({
    //         code: 'oas2-schema',
    //         message: "/info should have required property 'title'",
    //         path: ['info'],
    //         range: {
    //           end: {
    //             character: 1,
    //             line: 3,
    //           },
    //           start: {
    //             character: 0,
    //             line: 0,
    //           },
    //         },
    //         source: expect.stringContaining('src/cli/commands/__tests__/__fixtures__/refs/contact.json'),
    //       }),
    //     ]);
    //   });
  });
});
