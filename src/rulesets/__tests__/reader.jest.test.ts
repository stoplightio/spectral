import * as path from '@stoplight/path';
import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { IRule } from '../../types';
import { readRulesFromRulesets } from '../reader';

const validFlatRuleset = path.join(__dirname, './__fixtures__/valid-flat-ruleset.json');
const validRequireInfo = path.join(__dirname, './__fixtures__/valid-require-info-ruleset.yaml');
const enabledAllRuleset = path.join(__dirname, './__fixtures__/enable-all-ruleset.json');
const invalidRuleset = path.join(__dirname, './__fixtures__/invalid-ruleset.json');
const extendsOas2Ruleset = path.join(__dirname, './__fixtures__/extends-oas2-ruleset.json');
const extendsUnspecifiedOas2Ruleset = path.join(__dirname, './__fixtures__/extends-unspecified-oas2-ruleset.json');
const extendsDisabledOas2Ruleset = path.join(__dirname, './__fixtures__/extends-disabled-oas2-ruleset.yaml');
const extendsOas2WithOverrideRuleset = path.join(__dirname, './__fixtures__/extends-oas2-with-override-ruleset.json');
const extendsRelativeRuleset = path.join(__dirname, './__fixtures__/extends-relative-ruleset.json');
const myOpenAPIRuleset = path.join(__dirname, './__fixtures__/my-open-api-ruleset.json');
const oasRuleset = require('../oas/index.json');
const oas2Ruleset = require('../oas2/index.json');
const oas3Ruleset = require('../oas3/index.json');

jest.setTimeout(10000);

describe('Rulesets reader', () => {
  it('given flat, valid ruleset file should return rules', async () => {
    expect(await readRulesFromRulesets(validFlatRuleset)).toEqual({
      'valid-rule': {
        given: '$.info',
        message: 'should be OK',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'truthy',
        },
      },
    });
  });

  it('given two flat, valid ruleset files should return rules', async () => {
    expect(await readRulesFromRulesets(validFlatRuleset, validRequireInfo)).toEqual({
      'valid-rule': {
        given: '$.info',
        message: 'should be OK',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'truthy',
        },
      },
      'require-info': {
        given: '$.info',
        message: 'should be OK',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'truthy',
        },
      },
    });
  });

  it('should inherit properties of extended rulesets', async () => {
    const rules = await readRulesFromRulesets(extendsOas2Ruleset);

    // we pick up *all* rules only from spectral:oas and spectral:oas2 and keep their severity level or set a default one
    expect(rules).toEqual({
      ...[...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
        (oasRules, [name, rule]) => {
          oasRules[name] = {
            ...rule,
            formats: expect.arrayContaining([expect.any(String)]),
            ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
          };

          return oasRules;
        },
        {},
      ),

      'valid-rule': {
        given: '$.info',
        message: 'should be OK',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'truthy',
        },
      },
    });
  });

  it('should inherit properties of extended rulesets and disable not recommended ones', () => {
    return expect(readRulesFromRulesets(extendsUnspecifiedOas2Ruleset)).resolves.toEqual({
      ...[...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
        (rules, [name, rule]) => {
          rules[name] = {
            ...rule,
            formats: expect.arrayContaining([expect.any(String)]),
            ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
            ...(!(rule as IRule).recommended && { severity: -1 }),
          };

          return rules;
        },
        {},
      ),

      'valid-rule': {
        given: '$.info',
        message: 'should be OK',
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'truthy',
        },
      },
    });
  });

  it('should set severity of disabled rules to off', () => {
    return expect(readRulesFromRulesets(extendsDisabledOas2Ruleset)).resolves.toEqual({
      ...[...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
        (rules, [name, rule]) => {
          rules[name] = {
            ...rule,
            formats: expect.arrayContaining([expect.any(String)]),
            severity: -1,
          };

          return rules;
        },
        {},
      ),

      'operation-operationId-unique': {
        // value of oasRuleset.rules['operation-operationId-unique']
        description: 'Every operation must have a unique `operationId`.',
        formats: expect.arrayContaining([expect.any(String)]),
        recommended: true,
        type: 'validation',
        severity: 0,
        given: '$',
        then: {
          function: 'oasOpIdUnique',
        },
        tags: ['operation'],
      },
    });
  });

  it('should override properties of extended rulesets', () => {
    return expect(readRulesFromRulesets(extendsOas2WithOverrideRuleset)).resolves.toHaveProperty(
      'operation-2xx-response',
      {
        description: 'should be overridden',
        given: '$.info',
        formats: expect.arrayContaining([expect.any(String)]),
        recommended: true,
        severity: DiagnosticSeverity.Warning,
        tags: ['operation'],
        then: {
          function: 'truthy',
        },
        type: 'style',
      },
    );
  });

  it('should persist disabled properties of extended rulesets', () => {
    return expect(readRulesFromRulesets(extendsOas2WithOverrideRuleset)).resolves.toHaveProperty(
      'operation-security-defined',
      {
        given: '$',
        recommended: true,
        formats: expect.arrayContaining([expect.any(String)]),
        severity: -1,
        description: 'Operation `security` values must match a scheme defined in the `securityDefinitions` object.',
        tags: ['operation'],
        then: {
          function: 'oasOpSecurityDefined',
          functionOptions: {
            schemesPath: ['securityDefinitions'],
          },
        },
        type: 'validation',
      },
    );
  });

  it('should prefer top-level ruleset severity level', async () => {
    const enabledRules = await readRulesFromRulesets(enabledAllRuleset);
    expect(enabledRules).toEqual(
      [...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
        (rules, [name, rule]) => {
          rules[name] = {
            ...rule,
            formats: expect.arrayContaining([expect.any(String)]),
            ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
          };

          return rules;
        },
        {},
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
    return expect(readRulesFromRulesets(myOpenAPIRuleset)).resolves.toEqual({
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
    });
  });

  it('should support local rulesets', () => {
    return expect(readRulesFromRulesets(extendsRelativeRuleset)).resolves.toEqual({
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
        severity: DiagnosticSeverity.Warning,
        then: {
          function: 'truthy',
        },
      },
    });
  });

  it('given non-existent ruleset should output error', () => {
    return expect(readRulesFromRulesets('oneParentRuleset')).rejects.toThrowError(
      'Could not parse https://unpkg.com/oneParentRuleset: Not Found',
    );
  });

  it('given invalid ruleset should output errors', () => {
    return expect(readRulesFromRulesets(invalidRuleset)).rejects.toThrowError(/should have required property/);
  });
});
