import * as path from '@stoplight/path';
import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import * as nock from 'nock';
import { RuleCollection, Spectral } from '../../spectral';
import { readRuleset } from '../readRuleset';

jest.mock('fs');
jest.mock('nanoid/non-secure');

const invalidRuleset = path.join(__dirname, './__fixtures__/invalid-ruleset.json');
const fooRuleset = path.join(__dirname, './__fixtures__/foo-ruleset.json');
const rulesetWithMissingFunctions = path.join(__dirname, './__fixtures__/ruleset-with-missing-functions.json');
const fooExtendsBarRuleset = path.join(__dirname, './__fixtures__/foo-extends-bar-ruleset.json');
const simpleExceptRuleset = path.join(__dirname, './__fixtures__/exceptions/simple.yaml');
const inheritingExceptRuleset = path.join(__dirname, './__fixtures__/exceptions/inheriting.yaml');
const invalidExceptRuleset = path.join(__dirname, './__fixtures__/exceptions/invalid.yaml');

function getFixturePath(name: string): string {
  return path.join(__dirname, '__fixtures__', name);
}

describe('Rulesets reader', () => {
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('given empty ruleset, should throw a user friendly error', async () => {
    await expect(readRuleset(getFixturePath('empty.json'))).rejects.toThrow('Ruleset must not empty');
  });

  it('given flat, valid ruleset file should return rules', async () => {
    expect(await readRuleset(getFixturePath('valid-flat-ruleset.json'))).toEqual(
      expect.objectContaining({
        rules: {
          'valid-rule': {
            given: '$.info',
            severity: DiagnosticSeverity.Warning,
            enabled: true,
            recommended: true,
            then: expect.any(Object),
          },
        },
      }),
    );
  });

  it('given two flat, valid ruleset files should return ruleset with rules', async () => {
    expect(
      await readRuleset([getFixturePath('valid-flat-ruleset.json'), getFixturePath('valid-flat-ruleset-2.json')]),
    ).toEqual(
      expect.objectContaining({
        rules: {
          'valid-rule': {
            given: '$.info',
            enabled: true,
            recommended: true,
            severity: DiagnosticSeverity.Warning,
            then: {
              function: 'truthy',
            },
          },
          'valid-rule-2': {
            given: '$.info',
            enabled: true,
            recommended: true,
            severity: DiagnosticSeverity.Warning,
            then: {
              function: 'truthy',
            },
          },
        },
      }),
    );
  });

  describe('severity', () => {
    function getEnabledRules(rules: RuleCollection) {
      return Object.keys(rules).filter(name => rules[name].enabled);
    }

    it('given ruleset with extends set to recommended, should enable recommended rules', async () => {
      const { rules } = await readRuleset(getFixturePath('severity/recommended.json'));
      expect(Object.keys(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'overridable-rule',
      ]);

      expect(rules).toStrictEqual((await readRuleset(getFixturePath('severity/implicit.json'))).rules);
    });

    it('given ruleset with extends set to all, should enable all rules but explicitly disabled', async () => {
      const { rules } = await readRuleset(getFixturePath('severity/all.json'));
      expect(Object.keys(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(rules)).toEqual([
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);
    });

    it('given ruleset with extends set to off, should disable all rules but explicitly enabled', async () => {
      const { rules } = await readRuleset(getFixturePath('severity/off.json'));
      expect(Object.keys(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(rules)).toEqual(['overridable-rule']);
    });

    it('given nested extends with severity set to off', async () => {
      const { rules } = await readRuleset(getFixturePath('severity/off-proxy.json'));
      expect(Object.keys(rules)).toEqual([
        'description-matches-stoplight',
        'title-matches-stoplight',
        'contact-name-matches-stoplight',
        'overridable-rule',
      ]);

      expect(getEnabledRules(rules)).toEqual(['overridable-rule']);
    });
  });

  it('should limit the scope of formats to a ruleset', async () => {
    const { rules } = await readRuleset(path.join(__dirname, '__fixtures__/formats/ruleset.json'));

    expect(Object.keys(rules)).toHaveLength(3);

    expect(rules['generic-valid-rule'].formats).toEqual(['oas2', 'oas3']);
    expect(rules['oas2-valid-rule'].formats).toEqual(['oas2']);
    expect(rules['oas3-valid-rule'].formats).toEqual(['oas3']);
  });

  it('should include parserOptions', async () => {
    const { parserOptions } = await readRuleset(path.join(__dirname, '__fixtures__/parser-options-ruleset.json'));

    expect(parserOptions).toStrictEqual({
      duplicateKeys: 'warn',
      incompatibleValues: 'off',
    });
  });

  describe('distribution', () => {
    it('should support loading rulesets distributed via npm', () => {
      const minFnCode = `module.exports = () => void 'foo'`;

      nock('https://unpkg.com')
        .get('/example-spectral-ruleset')
        .reply(
          200,
          JSON.stringify({
            functions: ['min'],
            rules: {
              'valid-foo-value': {
                given: '$',
                then: {
                  field: 'foo',
                  function: 'min',
                  functionOptions: {
                    value: 1,
                  },
                },
              },
            },
          }),
        )
        .get('/example-spectral-ruleset/functions/min.js')
        .reply(200, minFnCode);

      return expect(readRuleset(getFixturePath('npm/plain.json'))).resolves.toEqual({
        rules: {
          'valid-foo-value': {
            given: '$',
            severity: DiagnosticSeverity.Warning,
            enabled: true,
            recommended: true,
            then: {
              field: 'foo',
              function: 'random-id-0',
              functionOptions: {
                value: 1,
              },
            },
          },
        },
        functions: {
          min: {
            name: 'min',
            ref: 'random-id-0',
            schema: null,
            source: 'https://unpkg.com/example-spectral-ruleset/functions/min.js',
          },
          'random-id-0': {
            code: minFnCode,
            name: 'min',
            schema: null,
            source: 'https://unpkg.com/example-spectral-ruleset/functions/min.js',
          },
        },
        exceptions: {},
      });
    });

    it('should support loading rulesets distributed via npm with version specified', () => {
      const minFnCode = `module.exports = () => void 'foo'`;

      nock('https://unpkg.com')
        .get('/example-spectral-ruleset@0.0.3')
        .reply(
          200,
          JSON.stringify({
            functions: ['min'],
            rules: {
              'valid-foo-value': {
                given: '$',
                then: {
                  field: 'foo',
                  function: 'min',
                  functionOptions: {
                    value: 1,
                  },
                },
              },
            },
          }),
        )
        .get('/example-spectral-ruleset@0.0.3/functions/min.js')
        .reply(200, minFnCode);

      return expect(readRuleset(getFixturePath('npm/versioned.json'))).resolves.toEqual({
        rules: {
          'valid-foo-value': {
            given: '$',
            severity: DiagnosticSeverity.Warning,
            enabled: true,
            recommended: true,
            then: {
              field: 'foo',
              function: 'random-id-0',
              functionOptions: {
                value: 1,
              },
            },
          },
        },
        functions: {
          min: {
            name: 'min',
            ref: 'random-id-0',
            schema: null,
            source: 'https://unpkg.com/example-spectral-ruleset@0.0.3/functions/min.js',
          },
          'random-id-0': {
            code: minFnCode,
            name: 'min',
            schema: null,
            source: 'https://unpkg.com/example-spectral-ruleset@0.0.3/functions/min.js',
          },
        },
        exceptions: {},
      });
    });
  });

  it('given a ruleset with custom functions should return rules and resolved functions', async () => {
    const fooCJSFunction = fs.readFileSync(path.join(__dirname, './__fixtures__/functions/foo.cjs.js'), 'utf8');
    const ruleset = await readRuleset(fooRuleset);
    expect(ruleset.functions).toEqual({
      'foo.cjs': {
        name: 'foo.cjs',
        ref: 'random-id-0',
        schema: null,
        source: path.join(fooRuleset, '../functions/foo.cjs.js'),
      },
      'random-id-0': {
        name: 'foo.cjs',
        code: fooCJSFunction,
        schema: null,
        source: path.join(fooRuleset, '../functions/foo.cjs.js'),
      },
    });

    expect(ruleset.rules).toEqual({
      'foo-rule': expect.objectContaining({
        message: 'should be OK',
        given: '$.info',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'random-id-0',
        },
      }),
    });
  });

  it('should load functions from custom directory', async () => {
    const base = getFixturePath('customFunctionsRuleset');
    const barFunction = fs.readFileSync(path.join(base, './customFunctions/bar.js'), 'utf8');
    const truthyFunction = fs.readFileSync(path.join(base, './customFunctions/truthy.js'), 'utf8');
    const ruleset = await readRuleset(path.join(base, './ruleset.json'));

    expect(Object.keys(ruleset.functions)).toHaveLength(4);
    expect(ruleset.functions).toEqual(
      expect.objectContaining({
        bar: {
          name: 'bar',
          ref: expect.stringMatching(/^random-id-[01]$/),
          schema: null,
          source: path.join(base, './customFunctions/bar.js'),
        },
        truthy: {
          name: 'truthy',
          ref: expect.stringMatching(/^random-id-[01]$/),
          schema: null,
          source: path.join(base, './customFunctions/truthy.js'),
        },
      }),
    );

    const [barRandomName, barFunctionDef] = Object.entries(ruleset.functions).find(
      ([name]) => ruleset.functions.bar.ref === name,
    )!;
    const [truthyRandomName, truthyFunctionDef] = Object.entries(ruleset.functions).find(
      ([name]) => ruleset.functions.truthy.ref === name,
    )!;

    // now let's verify unique properties include proper functions
    expect(barFunctionDef).toEqual({
      name: 'bar',
      code: barFunction,
      schema: null,
      source: path.join(base, './customFunctions/bar.js'),
    });

    expect(truthyFunctionDef).toEqual({
      name: 'truthy',
      code: truthyFunction,
      schema: null,
      source: path.join(base, './customFunctions/truthy.js'),
    });

    expect(ruleset.functions.bar).toHaveProperty('name', 'bar');
    expect(ruleset.functions.truthy).toHaveProperty('name', 'truthy');

    expect(ruleset.rules).toEqual({
      'bar-rule': expect.objectContaining({
        given: '$.info',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: barRandomName,
        },
      }),
      'truthy-rule': expect.objectContaining({
        given: '$.x',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: truthyRandomName,
        },
      }),
    });
  });

  it('should fail if function cannot be loaded', () => {
    nock('https://unpkg.com').get('/boo.js').reply(404);

    return expect(readRuleset(rulesetWithMissingFunctions)).rejects.toThrowError();
  });

  it('should handle ruleset with circular extensions', () => {
    return expect(readRuleset(fooExtendsBarRuleset)).resolves.toEqual({
      exceptions: {},
      functions: {},
      rules: {
        'bar-rule': {
          given: '$.bar',
          message: 'Bar is truthy',
          enabled: true,
          recommended: true,
          severity: DiagnosticSeverity.Warning,
          then: {
            function: 'truthy',
          },
        },
        'foo-rule': {
          given: '$.foo',
          message: 'Foo is falsy',
          enabled: true,
          recommended: true,
          severity: DiagnosticSeverity.Warning,
          then: {
            function: 'falsy',
          },
        },
      },
    });
  });

  it('should handle ruleset that extends itself', () => {
    return expect(readRuleset(path.join(__dirname, './__fixtures__/self-extending-ruleset.json'))).resolves.toEqual({
      exceptions: {},
      functions: {},
      rules: {
        'foo-rule': {
          given: '$',
          message: 'Foo',
          severity: DiagnosticSeverity.Warning,
          enabled: true,
          recommended: true,
          then: {
            function: 'falsy',
          },
        },
      },
    });
  });

  it('given non-existent ruleset should output error', () => {
    nock('https://unpkg.com').get('/oneParentRuleset').reply(404);

    return expect(readRuleset('oneParentRuleset')).rejects.toThrowError(
      'Could not parse https://unpkg.com/oneParentRuleset: Not Found',
    );
  });

  it('should reject if request is not finished within a specified timeout', () => {
    nock('https://unpkg.com').get('/oneParentRuleset').delay(10000).reply(200);

    const ruleset = readRuleset('oneParentRuleset', { timeout: 100 });

    return expect(ruleset).rejects.toThrowError('Could not parse https://unpkg.com/oneParentRuleset: Timeout');
  });

  it('given invalid ruleset should output errors', () => {
    return expect(readRuleset(invalidRuleset)).rejects.toThrowError(/must have required property/);
  });

  it('is able to load the whole ruleset from static file', async () => {
    nock.disableNetConnect();

    const readFileSpy = jest.spyOn(fs, 'readFile');

    Spectral.registerStaticAssets(require('../../../rulesets/assets/assets.json'));

    const { rules, functions } = await readRuleset('spectral:oas');

    expect(rules).toMatchObject({
      'openapi-tags': expect.objectContaining({
        description: 'OpenAPI object should have non-empty `tags` array.',
        formats: ['oas2', 'oas3'],
      }),
      'oas2-schema': expect.objectContaining({
        description: 'Validate structure of OpenAPI v2 specification.',
        formats: ['oas2'],
      }),
      'oas3-schema': expect.objectContaining({
        description: 'Validate structure of OpenAPI v3 specification.',
        formats: ['oas3'],
      }),
    });

    expect(functions).toMatchObject({
      oasOpSuccessResponse: expect.any(Object),
      oasOpFormDataConsumeCheck: expect.any(Object),
      oasOpIdUnique: expect.any(Object),
      oasOpParams: expect.any(Object),
      oasOpSecurityDefined: expect.any(Object),
      oasPathParam: expect.any(Object),
    });

    expect(readFileSpy).not.toBeCalled();
    readFileSpy.mockRestore();
  });

  it('should support YAML merge keys', async () => {
    const ruleset = await readRuleset(path.join(__dirname, './__fixtures__/ruleset-with-merge-keys.yaml'));

    expect(ruleset.rules).toStrictEqual({
      'no-x-headers-request': {
        description: "All 'HTTP' headers SHOULD NOT include 'X-' headers (https://tools.ietf.org/html/rfc6648).",
        given: ["$..parameters[?(@.in == 'header')].name"],
        message: "HTTP header '{{value}}' SHOULD NOT include 'X-' prefix in {{path}}",
        enabled: true,
        recommended: true,
        severity: 1,
        then: {
          function: 'pattern',
          functionOptions: {
            notMatch: '/^[xX]-/',
          },
        },
        type: 'style',
      },
      'no-x-headers-response': {
        description: "All 'HTTP' headers SHOULD NOT include 'X-' headers (https://tools.ietf.org/html/rfc6648).",
        given: ['$.[responses][*].headers.*~'],
        message: "HTTP header '{{value}}' SHOULD NOT include 'X-' prefix in {{path}}",
        enabled: true,
        recommended: true,
        severity: 1,
        then: {
          function: 'pattern',
          functionOptions: {
            notMatch: '/^[xX]-/',
          },
        },
        type: 'style',
      },
    });
  });

  it('should respect documentationUrl', async () => {
    const ruleset = await readRuleset(path.join(__dirname, './__fixtures__/documentation-url-ruleset.json'));

    expect(ruleset.rules).toStrictEqual({
      'foo-rule': {
        documentationUrl:
          'https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/openapi-rules.md#foo-rule',
        given: '',
        enabled: true,
        recommended: true,
        severity: DiagnosticSeverity.Warning,
        then: {
          function: '',
        },
      },
      'bar-rule': {
        documentationUrl: 'https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/bar-rule.md',
        given: '',
        enabled: true,
        recommended: true,
        severity: DiagnosticSeverity.Warning,
        then: {
          function: '',
        },
      },
    });
  });

  it('should not resolve json-schema.org $refs', async () => {
    expect(await readRuleset(getFixturePath('json-schema-org-ruleset.json'))).toEqual(
      expect.objectContaining({
        rules: {
          'json-schema': {
            enabled: true,
            given: '$',
            recommended: true,
            severity: DiagnosticSeverity.Warning,
            then: {
              function: 'valid',
              functionOptions: {
                $ref: 'http://json-schema.org/draft-04/schema#',
              },
            },
          },
        },
      }),
    );
  });

  describe('Exceptions loading', () => {
    it('should handle loading a standalone ruleset', async () => {
      const ruleset = await readRuleset(path.join(__dirname, './__fixtures__/exceptions/standalone.yaml'));

      expect(Object.entries(ruleset.exceptions)).toEqual([
        [expect.stringMatching('/__tests__/__fixtures__/exceptions/one.yaml#$'), ['my-rule-1']],
        [expect.stringMatching('/__tests__/__fixtures__/two.yaml#$'), ['my-rule-2']],
        [expect.stringMatching('/__tests__/__fixtures__/exceptions/sub/three.yaml#$'), ['my-rule-3']],
      ]);
    });

    it('should throw when ruleset contains invalid exceptions', () => {
      expect(readRuleset(invalidExceptRuleset)).rejects.toThrow('is not a valid uri');
    });

    it('should handle loading a ruleset deriving from a built-in one', async () => {
      const ruleset = await readRuleset(simpleExceptRuleset);

      expect(Object.entries(ruleset.exceptions)).toEqual([
        [expect.stringMatching('/__tests__/__fixtures__/exceptions/one.yaml#$'), ['my-rule-1']],
        [expect.stringMatching('/__tests__/__fixtures__/two.yaml#$'), ['my-rule-2']],
        [expect.stringMatching('/__tests__/__fixtures__/exceptions/sub/three.yaml#$'), ['my-rule-3']],
      ]);
    });

    it('should handle loading a ruleset deriving from another one', async () => {
      const ruleset = await readRuleset(inheritingExceptRuleset);

      expect(Object.entries(ruleset.exceptions)).toEqual([
        [expect.stringMatching('/__tests__/__fixtures__/exceptions/one.yaml#$'), ['my-rule-1']],
        [expect.stringMatching('/__tests__/__fixtures__/two.yaml#$'), ['my-rule-2']],
        [expect.stringMatching('/__tests__/__fixtures__/exceptions/sub/three.yaml#$'), ['my-rule-3']],
        [expect.stringMatching('/__tests__/__fixtures__/exceptions/four.yaml#$'), ['my-rule-4']],
      ]);
    });
  });
});
