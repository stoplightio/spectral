import { normalize } from '@stoplight/path';
import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from 'path';
import * as timers from 'timers';

import { httpAndFileResolver } from '../resolvers/http-and-file';
import { readRuleset } from '../ruleset';
import { IFunctionResult, Spectral } from '../spectral';
import { IRuleset, RulesetExceptionCollection } from '../types/ruleset';

const functionRuleset = path.join(__dirname, './__fixtures__/rulesets/custom-functions.json');
const exceptionRuleset = path.join(__dirname, './__fixtures__/rulesets/exceptions.json');
const customDirectoryFunctionsRuleset = path.join(__dirname, './__fixtures__/rulesets/custom-directory-function.json');
const recommendedRulesetPath = path.join(__dirname, './__fixtures__/rulesets/recommended.json');

describe('Linter', () => {
  let spectral: Spectral;

  beforeEach(() => {
    spectral = new Spectral();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    nock.cleanAll();
  });

  test('should not report anything for disabled rules', async () => {
    await spectral.loadRuleset(path.join(__dirname, './__fixtures__/rulesets/disabled.json'));

    const result = await spectral.run({});

    expect([...result]).toEqual([
      expect.objectContaining({
        code: 'explicitly-not-recommended',
      }),
      expect.objectContaining({
        code: 'implicitly-recommended',
      }),
    ]);
  });

  it('should make use of custom functions', async () => {
    await spectral.loadRuleset(functionRuleset);
    expect([...(await spectral.run({}))]).toEqual([
      expect.objectContaining({
        code: 'has-info-property',
        message: 'info property is missing',
      }),
    ]);
  });

  it('should prefer custom functions over the built-in ones', async () => {
    await spectral.loadRuleset(functionRuleset);
    expect([
      ...(await spectral.run({
        info: {
          contact: true,
        },
      })),
    ]).toEqual([]);

    // this is an actual for difference between the built-in ruleset and the custon one

    expect([
      ...(await spectral.run({
        info: {
          contact: 1,
        },
      })),
    ]).toEqual([
      expect.objectContaining({
        code: 'true-info-contact',
      }),
    ]);
  });

  it('should not run function if provided data does not match defined schema', async () => {
    await spectral.loadRuleset(functionRuleset);
    expect(await spectral.run({})).toEqual(
      expect.not.arrayContaining([
        // has-info-property-invalid is not executed
        expect.objectContaining({
          code: 'has-info-property-invalid',
        }),
      ]),
    );
  });

  describe('custom functions', () => {
    it('should have access to function-live lifespan cache', async () => {
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(Function);

      spectral.setRuleset({
        exceptions: {},
        rules: {
          foo: {
            given: '$',
            then: {
              function: 'fn',
            },
          },
          bar: {
            given: '$',
            then: {
              function: 'fn',
            },
          },
        },
        functions: {
          fn: {
            source: null,
            name: 'fn',
            schema: null,
            code: `module.exports = function() {
console.log(this.cache.get('test') || this.cache.set('test', []).get('test'));
}`,
          },
        },
      });

      await spectral.run({});

      // verifies whether the 2 subsequent calls passed the same cache instance as the first argument
      expect(logSpy.mock.calls[0][0]).toBe(logSpy.mock.calls[1][0]);

      await spectral.run({});

      expect(logSpy.mock.calls[2][0]).toBe(logSpy.mock.calls[3][0]);
      expect(logSpy.mock.calls[0][0]).toBe(logSpy.mock.calls[2][0]);
    });

    it('should have access to cache that is not shared among them', async () => {
      const logSpy = jest.spyOn(global.console, 'log').mockImplementation(Function);

      spectral.setRuleset({
        exceptions: {},
        rules: {
          foo: {
            given: '$',
            then: {
              function: 'fn',
            },
          },
          bar: {
            given: '$',
            then: {
              function: 'fn-2',
            },
          },
        },
        functions: {
          fn: {
            source: null,
            name: 'fn',
            schema: null,
            code: `module.exports = function() {
console.log(this.cache.get('test') || this.cache.set('test', []).get('test'));
}`,
          },
          'fn-2': {
            source: null,
            name: 'fn-2',
            schema: null,
            code: `module.exports = function() {
console.log(this.cache.get('test') || this.cache.set('test', []).get('test'));
}`,
          },
        },
      });

      await spectral.run({});

      // verifies whether the 2 subsequent calls **DID NOT** pass the same cache instance as the first argument
      expect(logSpy.mock.calls[0][0]).not.toBe(logSpy.mock.calls[1][0]);

      await spectral.run({});

      // verifies whether the 2 subsequent calls **DID NOT** pass the same cache instance as the first argument
      expect(logSpy.mock.calls[2][0]).not.toBe(logSpy.mock.calls[3][0]);

      // verifies whether the 2 subsequent calls to the same function passe the same cache instance as the first argument
      expect(logSpy.mock.calls[0][0]).toBe(logSpy.mock.calls[2][0]);
      expect(logSpy.mock.calls[1][0]).toBe(logSpy.mock.calls[3][0]);
    });

    it('should support require calls', async () => {
      await spectral.loadRuleset(functionRuleset);
      expect([
        ...(await spectral.run({
          info: {},
          paths: {},
        })),
      ]).toEqual([
        expect.objectContaining({
          code: 'has-bar-get-operation',
          message: 'Object does not have undefined property',
          path: ['paths'],
        }),
      ]);
    });

    it('should be able to call any available function', async () => {
      await spectral.loadRuleset(customDirectoryFunctionsRuleset);
      expect(await spectral.run({ bar: 2 })).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'validate-bar',
            message: '`bar` property should be a string',
          }),
        ]),
      );
    });

    it('should be able to make a request using fetch', async () => {
      const scope = nock('https://stoplight.io').get('/').once().reply(200);

      spectral.setRuleset({
        exceptions: {},
        functions: {
          fn: {
            source: null,
            schema: null,
            name: 'fn',
            code: `module.exports = () => void fetch('https://stoplight.io')`,
          },
        },
        rules: {
          empty: {
            given: '$',
            then: {
              function: 'fn',
            },
          },
        },
      });

      await spectral.run({});

      expect(scope.isDone()).toBe(true);
    });

    describe('async functions', () => {
      const fnName = 'asyncFn';

      beforeEach(() => {
        jest.useFakeTimers();

        spectral.setRules({
          'async-foo': {
            given: '$',
            severity: DiagnosticSeverity.Warning,
            then: {
              function: fnName,
            },
          },
        });
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should handle basic example', async () => {
        spectral.setFunctions({
          [fnName]() {
            return new Promise<IFunctionResult[]>(resolve => {
              setTimeout(resolve, 200, [
                {
                  message: 'Error reported by async fn',
                },
              ]);
            });
          },
        });

        const result = spectral.run({
          swagger: '2.0',
        });

        await new Promise(timers.setImmediate);

        jest.advanceTimersByTime(200);

        expect([...(await result)]).toEqual([
          {
            code: 'async-foo',
            message: 'Error reported by async fn',
            path: [],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Warning,
          },
        ]);
      });

      it('should handle rejections', async () => {
        spectral.setFunctions({
          [fnName]() {
            return new Promise<void>((resolve, reject) => {
              setTimeout(reject, 1000, new Error('Some unknown error'));
            });
          },
        });

        const result = spectral.run({
          swagger: '2.0',
        });

        await new Promise(timers.setImmediate);

        jest.advanceTimersByTime(1000);

        expect([...(await result)]).toEqual([]);
      });

      it('should be able to make actual requests', async () => {
        spectral.setRuleset({
          exceptions: {},
          functions: {
            [fnName]: {
              name: fnName,
              schema: null,
              source: null,
              code: `module.exports = async function (targetVal) {
  if (!this.cache.has('dictionary')) {
    const res = await fetch('https://dictionary.com/evil');
    if (res.ok) {
      this.cache.set('dictionary', await res.json());
    } else {
      // you can either re-try or just throw an error
    }
  }

  const dictionary = this.cache.get('dictionary');

  if (dictionary.includes(targetVal)) {
    return [{ message: '\`' + targetVal + '\`' + ' is a forbidden word.' }];
  }
}`,
            },
          },
          rules: {
            'no-evil-words': {
              given: '$..*@string()',
              severity: DiagnosticSeverity.Warning,
              then: {
                function: fnName,
              },
            },
          },
        });

        nock('https://dictionary.com')
          .persist()
          .get('/evil')
          .reply(200, JSON.stringify(['foo', 'bar', 'baz']));

        const results = await spectral.run({
          swagger: '2.0',
          info: {
            contact: {
              email: 'foo',
              author: 'baz',
            },
          },
          paths: {
            '/user': {},
          },
        });

        expect([...results]).toEqual([
          {
            code: 'no-evil-words',
            message: '`foo` is a forbidden word.',
            path: ['info', 'contact', 'email'],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Warning,
          },
          {
            code: 'no-evil-words',
            message: '`baz` is a forbidden word.',
            path: ['info', 'contact', 'author'],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Warning,
          },
        ]);
      });

      it('should be able to defer request and make it in beforeTeardown step', async () => {
        spectral.setRuleset({
          exceptions: {},
          functions: {
            [fnName]: {
              name: fnName,
              schema: null,
              source: null,
              code: await fs.promises.readFile(
                path.join(__dirname, './__fixtures__/asyncFunctions/lifecycle.js'),
                'utf8',
              ),
            },
          },
          rules: {
            'no-evil-words': {
              given: '$..*@string()',
              severity: DiagnosticSeverity.Warning,
              then: {
                function: fnName,
              },
            },
          },
        });

        const forbiddenWords = ['foo', 'baz'];

        nock('https://dictionary.com')
          .get('/evil')
          .query(query => 'words' in query)
          .reply(uri => {
            const [, words] = /words=([^/&]+)$/.exec(uri)!;
            return [200, words.split(',').filter(word => forbiddenWords.includes(word.toLowerCase()))];
          });

        const results = await spectral.run({
          swagger: '2.0',
          info: {
            contact: {
              email: 'foo',
              author: 'baz',
            },
          },
          paths: {
            '/user': {},
          },
        });

        expect([...results]).toEqual([
          {
            code: 'no-evil-words',
            message: '`foo` is a forbidden word.',
            path: ['info', 'contact', 'email'],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Warning,
          },
          {
            code: 'no-evil-words',
            message: '`baz` is a forbidden word.',
            path: ['info', 'contact', 'author'],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Warning,
          },
        ]);
      });
    });
  });

  it('should respect the scope of defined functions (ruleset-based)', async () => {
    await spectral.loadRuleset(customDirectoryFunctionsRuleset);
    expect([...(await spectral.run({}))]).toEqual([
      expect.objectContaining({
        code: 'has-field-property',
        message: 'Object does not have field property',
      }),
      expect.objectContaining({
        code: 'has-info-property',
        message: 'info property is missing',
      }),
    ]);
  });

  it('should report resolving errors for correct files', async () => {
    spectral = new Spectral({ resolver: httpAndFileResolver });

    const documentUri = path.join(__dirname, './__fixtures__/schemas/doc.json');
    const result = await spectral.run(
      {
        $ref: './user.json',
      },
      {
        ignoreUnknownFormat: true,
        resolve: {
          documentUri,
        },
      },
    );

    expect([...result]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid-ref',
          message: `ENOENT: no such file or directory, open '${path.join(
            normalize(documentUri),
            '../broken-age.yaml',
          )}'`,
          path: ['age', '$ref'],
          source: normalize(path.join(documentUri, '../user.json')),
        }),
        expect.objectContaining({
          code: 'invalid-ref',
          message: `ENOENT: no such file or directory, open '${path.join(
            normalize(documentUri),
            '../broken-length.json',
          )}'`,
          path: ['maxLength', '$ref'],
          source: normalize(path.join(documentUri, '../name.json')),
        }),
      ]),
    );
  });

  describe('evaluate "value" in validation messages', () => {
    test('should print correct values for referenced files', async () => {
      spectral = new Spectral({ resolver: httpAndFileResolver });

      spectral.setRules({
        'empty-is-falsy': {
          severity: DiagnosticSeverity.Error,
          recommended: true,
          description: 'Should be falsy',
          message: 'Value #{{print("value")}} should be falsy',
          given: '$..empty',
          then: {
            function: 'falsy',
          },
        },
      });

      return expect(
        spectral.run(
          {
            empty: {
              $ref: './__fixtures__/petstore.merge.keys.oas3.json#/info/contact/url',
            },
            bar: {
              empty: {
                $ref: './__fixtures__/petstore.oas3.json#/servers',
              },
            },
            foo: {
              empty: {
                $ref: './__fixtures__/petstore.oas3.json#/info',
              },
            },
          },
          {
            resolve: {
              documentUri: path.join(__dirname, 'foo.json'),
            },
          },
        ),
      ).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'empty-is-falsy',
            message: 'Value "https://example.com" should be falsy',
            path: ['info', 'contact', 'url'],
          }),
          expect.objectContaining({
            code: 'empty-is-falsy',
            message: 'Value Array[] should be falsy',
            path: ['servers'],
          }),
          expect.objectContaining({
            code: 'empty-is-falsy',
            message: 'Value Object{} should be falsy',
            path: ['info'],
          }),
        ]),
      );
    });
  });

  describe('Exceptions handling', () => {
    it('should ignore specified rules violations in a standalone document', async () => {
      await spectral.loadRuleset(exceptionRuleset);

      const results = await spectral.run(
        {
          openapi: '3.0.2',
          info: {
            title: '',
          },
        },
        {
          resolve: {
            documentUri: '/test/file.json',
          },
        },
      );

      expect(results.length).toBeGreaterThan(0);

      expect(results).not.toContainEqual(
        expect.objectContaining({
          code: 'info-contact',
        }),
      );

      expect(results).not.toContainEqual(
        expect.objectContaining({
          code: 'info-description',
        }),
      );

      expect(results).not.toContainEqual(
        expect.objectContaining({
          code: 'oas3-api-servers',
        }),
      );
    });

    it('should not swallow results', async () => {
      // Cf. https://github.com/stoplightio/spectral/issues/1018

      const document = {
        openapi: '3.0.2',
        paths: {
          '/a.one': { get: 17 },
          '/a.two': { get: 18 },
          '/a.three': { get: 19 },
          '/b.one': { get: 17 },
          '/b.two': { get: 18 },
          '/b.three': { get: 19 },
        },
      };

      await spectral.loadRuleset(exceptionRuleset);

      const res = await spectral.run(document, {
        resolve: {
          documentUri: '/test/file.json',
        },
      });

      expect(res).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'operation-success-response',
            message: 'Operation must have at least one `2xx` or `3xx` response.',
            path: ['paths', '/a.one', 'get'],
            source: '/test/file.json',
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            message: 'Operation must have at least one `2xx` or `3xx` response.',
            path: ['paths', '/a.three', 'get'],
            source: '/test/file.json',
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            message: 'Operation must have at least one `2xx` or `3xx` response.',
            path: ['paths', '/b.one', 'get'],
            source: '/test/file.json',
          }),
          expect.objectContaining({
            code: 'operation-success-response',
            message: 'Operation must have at least one `2xx` or `3xx` response.',
            path: ['paths', '/b.two', 'get'],
            source: '/test/file.json',
          }),
        ]),
      );

      expect(res).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            code: 'operation-success-response',
            message: 'Operation must have at least one `2xx` or `3xx` response.',
            path: ['paths', '/a.two', 'get'],
            source: '/test/file.json',
          }),
        ]),
      );

      expect(res).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({
            code: 'operation-success-response',
            message: 'Operation must have at least one `2xx` or `3xx` response.',
            path: ['paths', '/b.three', 'get'],
            source: '/test/file.json',
          }),
        ]),
      );
    });

    describe('resolving', () => {
      const document = {
        openapi: '3.0.2',
        components: {
          schemas: {
            TheLocalType: {
              $ref: './__fixtures__/exceptions.remote.oas3.yaml#/components/schemas/TheRemoteType',
            },
            integerOne: {
              type: 'integer',
            },
            integerRemote: {
              $ref: './__fixtures__/exceptions.remote.oas3.yaml#/components/schemas/integerOne',
            },
            integerTwo: {
              type: 'integer',
            },
          },
        },
      };

      let testRuleset: IRuleset;

      beforeAll(async () => {
        testRuleset = await readRuleset(path.join(__dirname, './__fixtures__/rulesets/exceptions-resolving.json'));
      });

      const opts = {
        resolve: {
          documentUri: path.join(__dirname, './foo.json'),
        },
      };

      const extractExceptionFrom = (ruleset: IRuleset, name: string, position: number): RulesetExceptionCollection => {
        const exceptions = {};
        const key = Object.keys(ruleset.exceptions)[position];
        expect(ruleset.exceptions[key]).toEqual([name]);
        exceptions[key] = ruleset.exceptions[key];

        return exceptions;
      };

      it('should ignore specified rules violations in a referenced document', async () => {
        spectral = new Spectral({ resolver: httpAndFileResolver });

        const rules = {
          'strings-maxLength': testRuleset.rules['strings-maxLength'],
          schema: testRuleset.rules.schema,
        };

        spectral.setRuleset({ rules, exceptions: {}, functions: {} });

        const first = await spectral.run(document, opts);

        expect([...first]).toEqual([
          expect.objectContaining({
            code: 'strings-maxLength',
          }),
          expect.objectContaining({
            code: 'schema',
          }),
        ]);

        const exceptions = extractExceptionFrom(testRuleset, 'strings-maxLength', 0);

        spectral.setRuleset({ rules, exceptions, functions: {} });

        const second = await spectral.run(document, opts);

        expect([...second]).toEqual([
          expect.objectContaining({
            code: 'schema',
          }),
        ]);
      });

      it('should ignore specified rules violations in "resolved=false" mode', async () => {
        spectral = new Spectral({ resolver: httpAndFileResolver });

        const rules = {
          'no-yaml-remote-reference': testRuleset.rules['no-yaml-remote-reference'],
          'no-remote-reference': testRuleset.rules['no-remote-reference'],
          'no-json-schema-integer-type': testRuleset.rules['no-json-schema-integer-type'],
          schema: testRuleset.rules.schema,
        };

        spectral.setRuleset({ rules, exceptions: {}, functions: {} });

        const first = await spectral.run(document, opts);

        expect([...first]).toEqual([
          expect.objectContaining({
            code: 'no-json-schema-integer-type',
          }),
          expect.objectContaining({
            code: 'schema',
          }),
          expect.objectContaining({
            code: 'no-remote-reference',
          }),
          expect.objectContaining({
            code: 'no-yaml-remote-reference',
          }),
          expect.objectContaining({
            code: 'no-json-schema-integer-type',
          }),
          expect.objectContaining({
            code: 'no-remote-reference',
          }),
          expect.objectContaining({
            code: 'no-yaml-remote-reference',
          }),
          expect.objectContaining({
            code: 'no-json-schema-integer-type',
          }),
        ]);

        spectral.setRuleset({ rules, exceptions: testRuleset.exceptions, functions: {} });

        const second = await spectral.run(document, opts);

        expect([...second]).toEqual([
          expect.objectContaining({
            code: 'schema',
          }),
          expect.objectContaining({
            code: 'no-json-schema-integer-type',
            path: ['components', 'schemas', 'integerTwo', 'type'],
          }),
        ]);
      });
    });
  });

  test('should only run recommended rules, whether implicitly or explicitly', async () => {
    const target = {
      openapi: '3.0.2',
    };

    await spectral.loadRuleset(recommendedRulesetPath);

    expect(Object.keys(spectral.rules)).toHaveLength(3);

    expect(Object.entries(spectral.rules).map(([name, rule]) => [name, rule.enabled])).toEqual([
      ['explicitly-recommended', true],
      ['implicitly-recommended', true],
      ['explicitly-not-recommended', false],
    ]);

    const results = await spectral.run(target);

    expect([...results]).toEqual([
      expect.objectContaining({
        code: 'explicitly-recommended',
      }),
      expect.objectContaining({
        code: 'implicitly-recommended',
      }),
    ]);
  });
});
