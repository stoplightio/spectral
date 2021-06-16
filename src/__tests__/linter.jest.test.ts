import { normalize } from '@stoplight/path';
import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import * as nock from 'nock';
import * as path from 'path';
import * as timers from 'timers';

import { httpAndFileResolver } from '../resolvers/http-and-file';
import { IFunctionResult, Spectral } from '../spectral';

const functionRuleset = path.join(__dirname, './__fixtures__/rulesets/custom-functions.json');
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

    expect(result).toEqual([
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
    expect(await spectral.run({})).toEqual([
      expect.objectContaining({
        code: 'has-info-property',
        message: 'info property is missing',
      }),
    ]);
  });

  it('should prefer custom functions over the built-in ones', async () => {
    await spectral.loadRuleset(functionRuleset);
    expect(
      await spectral.run({
        info: {
          contact: true,
        },
      }),
    ).toEqual([]);

    // this is an actual for difference between the built-in ruleset and the custon one

    expect(
      await spectral.run({
        info: {
          contact: 1,
        },
      }),
    ).toEqual([
      expect.objectContaining({
        code: 'true-info-contact',
      }),
    ]);
  });

  describe('custom functions', () => {
    it('should support require calls', async () => {
      await spectral.loadRuleset(functionRuleset);
      expect(
        await spectral.run({
          info: {},
          paths: {},
        }),
      ).toEqual([
        expect.objectContaining({
          code: 'has-bar-get-operation',
          message: 'Object does not have undefined property',
          path: ['paths'],
        }),
      ]);
    });

    it('should be able to make a request using fetch', async () => {
      const scope = nock('https://stoplight.io').get('/').once().reply(200);

      spectral.setRuleset({
        functions: {
          fn: {
            source: null,
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

        expect(await result).toEqual([
          {
            code: 'async-foo',
            message: 'Error reported by async fn',
            path: [],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Warning,
          },
        ]);
      });

      it('given a rejection, should throw', async () => {
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

        await expect(result).rejects.toThrow();
      });

      it('should be able to make actual requests', async () => {
        spectral.setRuleset({
          functions: {
            [fnName]: {
              name: fnName,
              source: null,
              code: `const cache = new Map();
module.exports = async function (targetVal) {
  if (!cache.has('dictionary')) {
    const res = await fetch('https://dictionary.com/evil');
    if (res.ok) {
      cache.set('dictionary', await res.json());
    } else {
      // you can either re-try or just throw an error
    }
  }

  const dictionary = cache.get('dictionary');

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

        expect(results).toEqual([
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
          functions: {
            [fnName]: {
              name: fnName,
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

        expect(results).toEqual([
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
    expect(await spectral.run({})).toEqual([
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

    expect(result).toEqual(
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

    const res = await spectral.run(target);

    expect(res).toEqual([
      expect.objectContaining({
        code: 'explicitly-recommended',
      }),
      expect.objectContaining({
        code: 'implicitly-recommended',
      }),
    ]);
  });
});
