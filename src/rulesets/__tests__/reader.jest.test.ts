import * as path from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import * as nock from 'nock';
import { IRule, Rule } from '../../types';
import { readRuleset } from '../reader';
const nanoid = require('nanoid');

jest.mock('nanoid');

const validFlatRuleset = path.join(__dirname, './__fixtures__/valid-flat-ruleset.json');
const validRequireInfo = path.join(__dirname, './__fixtures__/valid-require-info-ruleset.yaml');
const github447 = path.join(__dirname, './__fixtures__/github-issue-447-fixture.yaml');
const enabledAllRuleset = path.join(__dirname, './__fixtures__/enable-all-ruleset.json');
const invalidRuleset = path.join(__dirname, './__fixtures__/invalid-ruleset.json');
const extendsAllOas2Ruleset = path.join(__dirname, './__fixtures__/extends-oas2-ruleset.json');
const extendsUnspecifiedOas2Ruleset = path.join(__dirname, './__fixtures__/extends-unspecified-oas2-ruleset.json');
const extendsDisabledOas2Ruleset = path.join(__dirname, './__fixtures__/extends-disabled-oas2-ruleset.yaml');
const extendsOas2WithOverrideRuleset = path.join(__dirname, './__fixtures__/extends-oas2-with-override-ruleset.json');
const extendsRelativeRuleset = path.join(__dirname, './__fixtures__/extends-relative-ruleset.json');
const myOpenAPIRuleset = path.join(__dirname, './__fixtures__/my-open-api-ruleset.json');
const fooRuleset = path.join(__dirname, './__fixtures__/foo-ruleset.json');
const customFunctionsDirectoryRuleset = path.join(__dirname, './__fixtures__/custom-functions-directory-ruleset.json');
const rulesetWithMissingFunctions = path.join(__dirname, './__fixtures__/ruleset-with-missing-functions.json');
const fooExtendsBarRuleset = path.join(__dirname, './__fixtures__/foo-extends-bar-ruleset.json');
const selfExtendingRuleset = path.join(__dirname, './__fixtures__/self-extending-ruleset.json');
const fooCJSFunction = fs.readFileSync(path.join(__dirname, './__fixtures__/functions/foo.cjs.js'), 'utf-8');
const barFunction = fs.readFileSync(path.join(__dirname, './__fixtures__/customFunctions/bar.js'), 'utf-8');
const truthyFunction = fs.readFileSync(path.join(__dirname, './__fixtures__/customFunctions/truthy.js'), 'utf-8');
const oasRuleset = require('../oas/index.json');
const oas2Ruleset = require('../oas2/index.json');
const oas3Ruleset = require('../oas3/index.json');

jest.setTimeout(10000);

describe('Rulesets reader', () => {
  beforeEach(() => {
    let seed = 0;
    (nanoid as jest.Mock).mockImplementation(() => `random-id-${seed++}`);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('given flat, valid ruleset file should return rules', async () => {
    expect(await readRuleset(validFlatRuleset)).toEqual(
      expect.objectContaining({
        rules: {
          'valid-rule': {
            given: '$.info',
            message: 'should be OK',
            severity: -1,
            then: expect.any(Object),
          },
          'valid-rule-recommended': {
            given: '$.info',
            message: 'should be OK',
            severity: DiagnosticSeverity.Warning,
            recommended: true,
            then: expect.any(Object),
          },
        },
      }),
    );
  });

  it('given two flat, valid ruleset files should return ruleset with rules', async () => {
    expect(await readRuleset([validFlatRuleset, validRequireInfo])).toEqual(
      expect.objectContaining({
        rules: {
          'valid-rule': {
            given: '$.info',
            message: 'should be OK',
            severity: -1,
            then: expect.any(Object),
          },
          'valid-rule-recommended': {
            given: '$.info',
            message: 'should be OK',
            severity: DiagnosticSeverity.Warning,
            recommended: true,
            then: expect.any(Object),
          },
          'require-info': {
            given: '$.info',
            message: 'should be OK',
            severity: -1,
            then: expect.any(Object),
          },
        },
      }),
    );
  });

  it('should inherit properties of extended rulesets', async () => {
    const { rules } = await readRuleset(extendsAllOas2Ruleset);

    // we pick up *all* rules only from spectral:oas and spectral:oas2 and keep their severity level or set a default one
    expect(rules).toEqual(
      expect.objectContaining({
        ...[...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
          (oasRules, [name, rule]) => {
            oasRules[name] = {
              ...rule,
              formats: expect.arrayContaining([expect.any(String)]),
              ...((rule as IRule).severity === void 0 && { severity: DiagnosticSeverity.Warning }),
              then: expect.any(Object),
            };

            return oasRules;
          },
          {},
        ),

        'valid-rule': {
          given: '$.info',
          message: 'should be OK',
          severity: -1,
          then: expect.any(Object),
        },
      }),
    );
  });

  it('should inherit properties of extended rulesets and disable not recommended ones', () => {
    return expect(readRuleset(extendsUnspecifiedOas2Ruleset)).resolves.toEqual(
      expect.objectContaining({
        rules: expect.objectContaining({
          ...[...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
            (rules, [name, rule]) => {
              rules[name] = {
                ...rule,
                formats: expect.arrayContaining([expect.any(String)]),
                ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
                ...(!(rule as IRule).recommended && { severity: -1 }),
                then: expect.any(Object),
              };

              return rules;
            },
            {},
          ),

          'valid-rule': {
            given: '$.info',
            message: 'should be OK',
            severity: -1,
            then: expect.any(Object),
          },
        }),
      }),
    );
  });

  // https://github.com/stoplightio/spectral/issues/447
  it('given GitHub issue #447, loads recommended oas3 and oas rules correctly', async () => {
    const { rules: readRules } = await readRuleset(github447);

    expect(readRules).toEqual(
      expect.objectContaining({
        ...[...Object.entries(oasRuleset.rules), ...Object.entries(oas3Ruleset.rules)].reduce<Dictionary<unknown>>(
          (rules, [name, rule]) => {
            const formattedRule: Rule = {
              ...(rule as Rule),
              formats: expect.arrayContaining([expect.any(String)]),
              ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
              ...(!(rule as IRule).recommended && { severity: -1 }),
              then: expect.any(Object),
            };

            rules[name] = formattedRule;

            if (name === 'operation-operationId') {
              formattedRule.severity = DiagnosticSeverity.Error;
            }

            if (name === 'operation-tags') {
              formattedRule.severity = DiagnosticSeverity.Hint;
            }

            return rules;
          },
          {
            'schema-names-pascal-case': {
              description: 'Schema names MUST be written in PascalCase',
              given: '$.components.schemas.*~',
              message: '{{property}} is not PascalCase: {{error}}',
              recommended: true,
              severity: DiagnosticSeverity.Warning,
              then: {
                function: 'pattern',
                functionOptions: {
                  match: '^[A-Z][a-zA-Z0-9]*$',
                },
              },
              type: 'style',
            },
            'operation-id-kebab-case': {
              description: 'operationId MUST be written in kebab-case',
              given:
                "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' || @property === 'delete' || @property === 'options' || @property === 'head' || @property === 'patch' || @property === 'trace' )]",
              message: '{{property}} is not kebab-case: {{error}}',
              recommended: true,
              severity: DiagnosticSeverity.Warning,
              then: {
                field: 'operationId',
                function: 'pattern',
                functionOptions: {
                  match: '^[a-z][a-z0-9\\-]*$',
                },
              },
              type: 'style',
            },
          },
        ),
      }),
    );
  });

  it('should set severity of disabled rules to off', () => {
    return expect(readRuleset(extendsDisabledOas2Ruleset)).resolves.toHaveProperty(
      'rules',
      expect.objectContaining({
        ...[...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
          (rules, [name, rule]) => {
            rules[name] = expect.objectContaining({
              description: (rule as IRule).description,
              severity: -1,
            });

            return rules;
          },
          {},
        ),

        'operation-operationId-unique': expect.objectContaining({
          // value of oasRuleset.rules['operation-operationId-unique']
          description: 'Every operation must have a unique `operationId`.',
          recommended: true,
          type: 'validation',
          severity: DiagnosticSeverity.Error,
          given: '$',
          tags: ['operation'],
        }),
      }),
    );
  });

  it('should override properties of extended rulesets', () => {
    return expect(readRuleset(extendsOas2WithOverrideRuleset)).resolves.toHaveProperty('rules.operation-2xx-response', {
      description: 'should be overridden',
      given: '$.info',
      formats: expect.arrayContaining([expect.any(String)]),
      recommended: true,
      severity: DiagnosticSeverity.Warning,
      tags: ['operation'],
      then: expect.any(Object),
      type: 'style',
    });
  });

  it('should persist disabled properties of extended rulesets', () => {
    return expect(readRuleset(extendsOas2WithOverrideRuleset)).resolves.toHaveProperty(
      'rules.oas2-operation-security-defined',
      {
        given: '$',
        recommended: true,
        formats: expect.arrayContaining([expect.any(String)]),
        severity: -1,
        description: 'Operation `security` values must match a scheme defined in the `securityDefinitions` object.',
        tags: ['operation'],
        then: expect.any(Object),
        type: 'validation',
      },
    );
  });

  it('should prefer top-level ruleset severity level', async () => {
    const { rules: enabledRules } = await readRuleset(enabledAllRuleset);
    expect(enabledRules).toEqual(
      expect.objectContaining(
        [...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
          (rules, [name, rule]) => {
            rules[name] = expect.objectContaining({
              description: (rule as IRule).description,
              ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
            });

            return rules;
          },
          {},
        ),
      ),
    );

    // let's make sure all rules are enabled
    expect(
      Object.values(enabledRules).filter(
        rule => rule.severity === -1 || rule.severity === 'off' || rule.severity === undefined,
      ),
    ).toHaveLength(0);
  });

  it('should limit the scope of formats to a ruleset', () => {
    return expect(readRuleset(myOpenAPIRuleset)).resolves.toEqual(
      expect.objectContaining({
        rules: {
          ...Object.entries(oasRuleset.rules).reduce<Dictionary<unknown>>((rules, [name, rule]) => {
            rules[name] = expect.objectContaining({
              formats: ['oas2', 'oas3'],
            });

            return rules;
          }, {}),

          ...Object.entries(oas2Ruleset.rules).reduce<Dictionary<unknown>>((rules, [name, rule]) => {
            rules[name] = expect.objectContaining({
              formats: ['oas2'],
            });

            return rules;
          }, {}),

          ...Object.entries(oas3Ruleset.rules).reduce<Dictionary<unknown>>((rules, [name, rule]) => {
            rules[name] = expect.objectContaining({
              formats: ['oas3'],
            });

            return rules;
          }, {}),

          'valid-rule': expect.objectContaining({
            message: 'should be OK',
          }),
        },
      }),
    );
  });

  it('given spectral:oas ruleset, should not pick up unrecommended rules', () => {
    return expect(readRuleset('spectral:oas')).resolves.toEqual(
      expect.objectContaining({
        rules: expect.objectContaining({
          'contact-properties': expect.objectContaining({
            severity: -1,
            recommended: false,
          }),
        }),
      }),
    );
  });

  it('should support local rulesets', () => {
    return expect(readRuleset(extendsRelativeRuleset)).resolves.toEqual(
      expect.objectContaining({
        rules: {
          PascalCase: {
            given: '$',
            message: 'bar',
            severity: -1, // turned off, cause it's not recommended
            then: {
              function: 'truthy',
            },
          },
          camelCase: {
            given: '$',
            message: 'bar',
            recommended: true,
            severity: DiagnosticSeverity.Warning,
            then: {
              function: 'truthy',
            },
          },
          snake_case: {
            given: '$',
            message: 'foo',
            severity: -1,
            then: {
              function: 'truthy',
            },
          },
        },
      }),
    );
  });

  it('given a ruleset with custom functions should return rules and resolved functions', async () => {
    const ruleset = await readRuleset(fooRuleset);
    expect(ruleset.functions).toEqual({
      'foo.cjs': {
        name: 'foo.cjs',
        ref: 'random-id-0',
        schema: null,
      },
      'random-id-0': {
        name: 'foo.cjs',
        code: fooCJSFunction,
        schema: null,
      },
    });

    expect(ruleset.rules).toEqual({
      'foo-rule': expect.objectContaining({
        message: 'should be OK',
        given: '$.info',
        severity: -1,
        then: {
          function: 'random-id-0',
        },
      }),
    });
  });

  it('should load functions from custom directory', async () => {
    const ruleset = await readRuleset(customFunctionsDirectoryRuleset);
    expect(ruleset.functions).toEqual({
      bar: {
        name: 'bar',
        ref: 'random-id-0',
        schema: null,
      },
      'random-id-0': {
        name: 'bar',
        code: barFunction,
        schema: null,
      },
      truthy: {
        name: 'truthy',
        ref: 'random-id-1',
        schema: null,
      },
      'random-id-1': {
        name: 'truthy',
        code: truthyFunction,
        schema: null,
      },
    });

    expect(ruleset.functions.bar).toHaveProperty('name', 'bar');
    expect(ruleset.functions.truthy).toHaveProperty('name', 'truthy');

    expect(ruleset.rules).toEqual({
      'bar-rule': expect.objectContaining({
        message: 'should be OK',
        given: '$.info',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'random-id-0',
        },
      }),
      'truthy-rule': expect.objectContaining({
        message: 'should be OK',
        given: '$.x',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'random-id-1',
        },
      }),
    });
  });

  it('should not fail if function cannot be loaded', () => {
    return expect(readRuleset(rulesetWithMissingFunctions)).resolves.toEqual({
      rules: {},
      functions: {},
    });
  });

  it('should handle ruleset with circular extensions', () => {
    return expect(readRuleset(fooExtendsBarRuleset)).resolves.toEqual({
      functions: {},
      rules: {
        'bar-rule': {
          given: '$.bar',
          message: 'Bar is truthy',
          severity: -1, // rule was not recommended, hence the severity is set to false
          then: {
            function: 'truthy',
          },
        },
        'foo-rule': {
          given: '$.foo',
          message: 'Foo is falsy',
          severity: -1, // rule was not recommended, hence the severity is set to false
          then: {
            function: 'falsy',
          },
        },
      },
    });
  });

  it('should handle ruleset that extends itself', () => {
    return expect(readRuleset(selfExtendingRuleset)).resolves.toEqual({
      functions: {},
      rules: {
        'foo-rule': {
          given: '$',
          message: 'Foo',
          severity: DiagnosticSeverity.Warning,
          recommended: true,
          then: {
            function: 'falsy',
          },
        },
      },
    });
  });

  it('given non-existent ruleset should output error', () => {
    nock('https://unpkg.com')
      .get('/oneParentRuleset')
      .reply(404);

    return expect(readRuleset('oneParentRuleset')).rejects.toThrowError(
      'Could not parse https://unpkg.com/oneParentRuleset: Not Found',
    );
  });

  it('given invalid ruleset should output errors', () => {
    return expect(readRuleset(invalidRuleset)).rejects.toThrowError(/should have required property/);
  });
});
