import * as path from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import * as nock from 'nock';
import { Spectral } from '../../spectral';
import { IRule, RuleType } from '../../types';
import { readRuleset } from '../reader';
const nanoid = require('nanoid');

jest.mock('nanoid');
jest.mock('fs');

const validFlatRuleset = path.join(__dirname, './__fixtures__/valid-flat-ruleset.json');
const validRequireInfo = path.join(__dirname, './__fixtures__/valid-require-info-ruleset.yaml');
const github447 = path.join(__dirname, './__fixtures__/github-issue-447-fixture.yaml');
const enabledAllRuleset = path.join(__dirname, './__fixtures__/enable-all-ruleset.json');
const invalidRuleset = path.join(__dirname, './__fixtures__/invalid-ruleset.json');
const extendsOnlyRuleset = path.join(__dirname, './__fixtures__/extends-only-ruleset.json');
const extendsAllOasRuleset = path.join(__dirname, './__fixtures__/extends-oas-ruleset.json');
const extendsUnspecifiedOasRuleset = path.join(__dirname, './__fixtures__/extends-unspecified-oas-ruleset.json');
const extendsDisabledOasRuleset = path.join(__dirname, './__fixtures__/extends-disabled-oas-ruleset.yaml');
const extendsOasWithOverrideRuleset = path.join(__dirname, './__fixtures__/extends-oas-with-override-ruleset.json');
const extendsRelativeRuleset = path.join(__dirname, './__fixtures__/extends-relative-ruleset.json');
const myOpenAPIRuleset = path.join(__dirname, './__fixtures__/my-open-api-ruleset.json');
const fooRuleset = path.join(__dirname, './__fixtures__/foo-ruleset.json');
const customFunctionsDirectoryRuleset = path.join(__dirname, './__fixtures__/custom-functions-directory-ruleset.json');
const rulesetWithMissingFunctions = path.join(__dirname, './__fixtures__/ruleset-with-missing-functions.json');
const fooExtendsBarRuleset = path.join(__dirname, './__fixtures__/foo-extends-bar-ruleset.json');
const selfExtendingRuleset = path.join(__dirname, './__fixtures__/self-extending-ruleset.json');
const simpleDisableRuleset = path.join(__dirname, './__fixtures__/simple-disable-ruleset.yaml');
const fooCJSFunction = fs.readFileSync(path.join(__dirname, './__fixtures__/functions/foo.cjs.js'), 'utf8');
const barFunction = fs.readFileSync(path.join(__dirname, './__fixtures__/customFunctions/bar.js'), 'utf8');
const truthyFunction = fs.readFileSync(path.join(__dirname, './__fixtures__/customFunctions/truthy.js'), 'utf8');
const oasRuleset = require('../oas/index.json');
const oasRulesetRules: Dictionary<IRule, string> = oasRuleset.rules;

jest.setTimeout(10000);

describe('Rulesets reader', () => {
  beforeEach(() => {
    let seed = 0;
    (nanoid as jest.Mock).mockImplementation(() => `random-id-${seed++}`);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('given flat, valid ruleset file should return rules', async () => {
    expect(await readRuleset(validFlatRuleset)).toEqual(
      expect.objectContaining({
        rules: {
          'valid-rule': {
            given: '$.info',
            message: 'should be OK',
            severity: DiagnosticSeverity.Warning,
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
            severity: DiagnosticSeverity.Warning,
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
            severity: DiagnosticSeverity.Warning,
            then: expect.any(Object),
          },
        },
      }),
    );
  });

  it('given ruleset  with no custom rules extending other rulesets', async () => {
    const { rules } = await readRuleset(extendsOnlyRuleset);

    expect(rules).toEqual({
      'bar-rule': {
        given: '$.info',
        message: 'should be OK',
        recommended: true,
        severity: DiagnosticSeverity.Warning,
        then: {
          function: expect.stringMatching(/^random-id-\d$/),
        },
      },
      'foo-rule': {
        given: '$.info',
        message: 'should be OK',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: expect.stringMatching(/^random-id-\d$/),
        },
      },
      'truthy-rule': {
        given: '$.x',
        message: 'should be OK',
        recommended: true,
        severity: DiagnosticSeverity.Warning,
        then: {
          function: expect.stringMatching(/^random-id-\d$/),
        },
      },
    });
  });

  it('should inherit properties of extended rulesets', async () => {
    const { rules } = await readRuleset(extendsAllOasRuleset);

    // we pick up *all* rules only from spectral:oas and spectral:oas2 and keep their severity level or set a default one
    expect(rules).toEqual(
      expect.objectContaining({
        ...Object.entries(oasRulesetRules).reduce<Dictionary<IRule, string>>((oasRules, [name, rule]) => {
          oasRules[name] = {
            ...rule,
            formats: expect.arrayContaining([expect.any(String)]),
            ...((rule as IRule).severity === void 0 && { severity: DiagnosticSeverity.Warning }),
            then: expect.any(Object),
          };

          return oasRules;
        }, {}),

        'valid-rule': {
          given: '$.info',
          message: 'should be OK',
          severity: DiagnosticSeverity.Warning,
          then: expect.any(Object),
        },
      }),
    );
  });

  it('should inherit properties of extended rulesets and disable not recommended ones', () => {
    return expect(readRuleset(extendsUnspecifiedOasRuleset)).resolves.toEqual(
      expect.objectContaining({
        rules: expect.objectContaining({
          ...Object.entries(oasRulesetRules).reduce<Dictionary<IRule, string>>((rules, [name, rule]) => {
            rules[name] = {
              ...rule,
              formats: expect.arrayContaining([expect.any(String)]),
              ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
              ...((rule as IRule).recommended === false && { severity: -1 }),
              then: expect.any(Object),
            };

            return rules;
          }, {}),

          'valid-rule': {
            given: '$.info',
            message: 'should be OK',
            severity: DiagnosticSeverity.Warning,
            then: expect.any(Object),
          },
        }),
      }),
    );
  });

  it('should always disable a rule with false severity', () => {
    return expect(readRuleset(simpleDisableRuleset)).resolves.toHaveProperty(
      'rules.operation-description',
      expect.objectContaining({
        severity: -1,
      }),
    );
  });

  // https://github.com/stoplightio/spectral/issues/447
  it('given GitHub issue #447, loads recommended oas3 and oas rules correctly', async () => {
    const { rules: readRules } = await readRuleset(github447);

    expect(readRules).toEqual(
      expect.objectContaining({
        ...Object.entries(oasRulesetRules).reduce<Dictionary<IRule, string>>(
          (rules, [name, rule]) => {
            const formattedRule: IRule = {
              ...rule,
              formats: expect.arrayContaining([expect.any(String)]),
              ...((rule as IRule).severity === void 0 && { severity: DiagnosticSeverity.Warning }),
              ...((rule as IRule).recommended === false && { severity: -1 }),
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
              type: RuleType.STYLE,
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
              type: RuleType.STYLE,
            },
          },
        ),
      }),
    );
  });

  it('should set severity of disabled rules to off', () => {
    return expect(readRuleset(extendsDisabledOasRuleset)).resolves.toHaveProperty(
      'rules',
      expect.objectContaining({
        ...Object.entries(oasRuleset.rules).reduce<Dictionary<unknown>>((rules, [name, rule]) => {
          rules[name] = expect.objectContaining({
            description: (rule as IRule).description,
            severity: -1,
          });

          return rules;
        }, {}),

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
    return expect(readRuleset(extendsOasWithOverrideRuleset)).resolves.toHaveProperty('rules.operation-2xx-response', {
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
    return expect(readRuleset(extendsOasWithOverrideRuleset)).resolves.toHaveProperty(
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
        Object.entries(oasRuleset.rules).reduce<Dictionary<unknown>>((rules, [name, rule]) => {
          rules[name] = expect.objectContaining({
            description: (rule as IRule).description,
            ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
          });

          return rules;
        }, {}),
      ),
    );

    // let's make sure all rules are enabled
    expect(
      Object.values(enabledRules).filter(
        rule => rule.severity === -1 || rule.severity === 'off' || rule.severity === undefined,
      ),
    ).toHaveLength(0);
  });

  it('should limit the scope of formats to a ruleset', async () => {
    const rules = (await readRuleset(myOpenAPIRuleset)).rules;

    expect(Object.keys(rules)).toHaveLength(4);

    expect(rules['my-valid-rule'].formats).toBeUndefined();

    expect(rules['generic-valid-rule'].formats).toEqual(['oas2', 'oas3']);
    expect(rules['oas2-valid-rule'].formats).toEqual(['oas2']);
    expect(rules['oas3-valid-rule'].formats).toEqual(['oas3']);
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

  it('given ruleset with extends set to all, should enable all rules', () => {
    return expect(
      readRuleset(path.join(__dirname, './__fixtures__/inheritanceRulesets/my-ruleset.json')),
    ).resolves.toStrictEqual({
      functions: {},
      rules: {
        'contact-name-matches-stoplight': {
          given: '$.info.contact',
          message: 'Contact name must contain Stoplight',
          recommended: false,
          severity: DiagnosticSeverity.Warning,
          then: {
            field: 'name',
            function: 'pattern',
            functionOptions: {
              match: 'Stoplight',
            },
          },
          type: 'style',
        },
        'description-matches-stoplight': {
          given: '$.info',
          message: 'Description must contain Stoplight',
          severity: DiagnosticSeverity.Error,
          recommended: true,
          then: {
            field: 'description',
            function: 'pattern',
            functionOptions: {
              match: 'Stoplight',
            },
          },
          type: 'style',
        },
        'title-matches-stoplight': {
          given: '$.info',
          message: 'Title must contain Stoplight',
          severity: DiagnosticSeverity.Warning,
          then: {
            field: 'title',
            function: 'pattern',
            functionOptions: {
              match: 'Stoplight',
            },
          },
          type: 'style',
        },
      },
    });
  });

  it('given ruleset with extends set to recommended, should enable recommended rules', () => {
    return expect(
      readRuleset(path.join(__dirname, './__fixtures__/inheritanceRulesets/my-ruleset-recommended.json')),
    ).resolves.toStrictEqual({
      functions: {},
      rules: {
        'contact-name-matches-stoplight': {
          given: '$.info.contact',
          message: 'Contact name must contain Stoplight',
          recommended: false,
          severity: -1,
          then: {
            field: 'name',
            function: 'pattern',
            functionOptions: {
              match: 'Stoplight',
            },
          },
          type: 'style',
        },
        'description-matches-stoplight': {
          given: '$.info',
          message: 'Description must contain Stoplight',
          severity: DiagnosticSeverity.Error,
          recommended: true,
          then: {
            field: 'description',
            function: 'pattern',
            functionOptions: {
              match: 'Stoplight',
            },
          },
          type: 'style',
        },
        'title-matches-stoplight': {
          given: '$.info',
          message: 'Title must contain Stoplight',
          severity: DiagnosticSeverity.Warning,
          then: {
            field: 'title',
            function: 'pattern',
            functionOptions: {
              match: 'Stoplight',
            },
          },
          type: 'style',
        },
      },
    });
  });

  it('given ruleset with extends set to off, should disable all rules', () => {
    return expect(
      readRuleset(path.join(__dirname, './__fixtures__/inheritanceRulesets/ruleset-c.json')),
    ).resolves.toStrictEqual({
      functions: {},
      rules: {
        'contact-name-matches-stoplight': {
          given: '$.info.contact',
          message: 'Contact name must contain Stoplight',
          recommended: false,
          severity: -1,
          then: {
            field: 'name',
            function: 'pattern',
            functionOptions: {
              match: 'Stoplight',
            },
          },
          type: 'style',
        },
        'description-matches-stoplight': {
          given: '$.info',
          message: 'Description must contain Stoplight',
          severity: -1,
          recommended: true,
          then: {
            field: 'description',
            function: 'pattern',
            functionOptions: {
              match: 'Stoplight',
            },
          },
          type: 'style',
        },
        'title-matches-stoplight': {
          given: '$.info',
          message: 'Title must contain Stoplight',
          severity: -1,
          then: {
            field: 'title',
            function: 'pattern',
            functionOptions: {
              match: 'Stoplight',
            },
          },
          type: 'style',
        },
      },
    });
  });

  it('should support local rulesets', () => {
    return expect(readRuleset(extendsRelativeRuleset)).resolves.toEqual(
      expect.objectContaining({
        rules: {
          PascalCase: {
            given: '$',
            message: 'bar',
            severity: DiagnosticSeverity.Warning,
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
            severity: DiagnosticSeverity.Warning,
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
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'random-id-0',
        },
      }),
    });
  });

  it('should load functions from custom directory', async () => {
    const ruleset = await readRuleset(customFunctionsDirectoryRuleset);
    expect(Object.keys(ruleset.functions)).toHaveLength(4);
    expect(ruleset.functions).toEqual(
      expect.objectContaining({
        bar: {
          name: 'bar',
          ref: expect.stringMatching(/^random-id-[01]$/),
          schema: null,
        },
        truthy: {
          name: 'truthy',
          ref: expect.stringMatching(/^random-id-[01]$/),
          schema: null,
        },
      }),
    );

    const [barRandomName, barFunctionDef] = Object.entries(ruleset.functions).find(
      ([name, obj]) => ruleset.functions.bar.ref === name,
    )!;
    const [truthyRandomName, truthyFunctionDef] = Object.entries(ruleset.functions).find(
      ([name, obj]) => ruleset.functions.truthy.ref === name,
    )!;

    // now let's verify unique properties include proper functions
    expect(barFunctionDef).toEqual({
      name: 'bar',
      code: barFunction,
      schema: null,
    });

    expect(truthyFunctionDef).toEqual({
      name: 'truthy',
      code: truthyFunction,
      schema: null,
    });

    expect(ruleset.functions.bar).toHaveProperty('name', 'bar');
    expect(ruleset.functions.truthy).toHaveProperty('name', 'truthy');

    expect(ruleset.rules).toEqual({
      'bar-rule': expect.objectContaining({
        message: 'should be OK',
        given: '$.info',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: barRandomName,
        },
      }),
      'truthy-rule': expect.objectContaining({
        message: 'should be OK',
        given: '$.x',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: truthyRandomName,
        },
      }),
    });
  });

  it('should not fail if function cannot be loaded', () => {
    nock('https://unpkg.com')
      .get('/boo.js')
      .reply(404);

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
          severity: DiagnosticSeverity.Warning,
          then: {
            function: 'truthy',
          },
        },
        'foo-rule': {
          given: '$.foo',
          message: 'Foo is falsy',
          severity: DiagnosticSeverity.Warning,
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

  it('should reject if request is not finished within a specified timeout', () => {
    nock('https://unpkg.com')
      .get('/oneParentRuleset')
      .delay(10000)
      .reply(200);

    const ruleset = readRuleset('oneParentRuleset', { timeout: 100 });

    return expect(ruleset).rejects.toThrowError('Could not parse https://unpkg.com/oneParentRuleset: Timeout');
  });

  it('given invalid ruleset should output errors', () => {
    return expect(readRuleset(invalidRuleset)).rejects.toThrowError(/should have required property/);
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
      oasOp2xxResponse: expect.any(Object),
      oasOpFormDataConsumeCheck: expect.any(Object),
      oasOpIdUnique: expect.any(Object),
      oasOpParams: expect.any(Object),
      oasOpSecurityDefined: expect.any(Object),
      oasPathParam: expect.any(Object),
    });

    expect(readFileSpy).not.toBeCalled();
    readFileSpy.mockRestore();
  });
});
