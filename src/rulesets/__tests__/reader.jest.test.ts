import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import * as path from 'path';
import { IRule } from '../../types';
import { readRulesFromRulesets } from '../reader';

const validFlatRuleset = path.join(__dirname, './__fixtures__/valid-flat-ruleset.json');
const validFlatRuleset2 = path.join(__dirname, './__fixtures__/valid-require-info-ruleset.yaml');
const invalidRuleset = path.join(__dirname, './__fixtures__/invalid-ruleset.json');
const extendsOas2Ruleset = path.join(__dirname, './__fixtures__/extends-oas2-ruleset.json');
const extendsUnspecifiedOas2Ruleset = path.join(__dirname, './__fixtures__/extends-unspecified-oas2-ruleset.json');
const extendsOas2WithOverrideRuleset = path.join(__dirname, './__fixtures__/extends-oas2-with-override-ruleset.json');
const oasRuleset = require('../oas/index.json');
const oas2Ruleset = require('../oas2/index.json');

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
    expect(await readRulesFromRulesets(validFlatRuleset, validFlatRuleset2)).toEqual({
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

    // we pick up recommended rules only from spectral:oas
    expect(rules).toMatchObject(
      Object.entries(oasRuleset.rules).reduce<Dictionary<unknown>>((oasRules, [name, rule]) => {
        oasRules[name] = {
          ...rule,
          ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
          ...(!(rule as IRule).recommended && { severity: -1 }),
        };

        return oasRules;
      }, {}),
    );

    // we pick up all rules from spectral:oas2

    expect(rules).toMatchObject(
      Object.entries(oas2Ruleset.rules).reduce<Dictionary<unknown>>((oas2Rules, [name, rule]) => {
        oas2Rules[name] = {
          ...rule,
          ...((rule as IRule).severity === undefined && { severity: DiagnosticSeverity.Warning }),
        };

        return oas2Rules;
      }, {}),
    );

    expect(rules).toHaveProperty('valid-rule', {
      given: '$.info',
      message: 'should be OK',
      severity: DiagnosticSeverity.Warning,
      then: {
        function: 'truthy',
      },
    });
  });

  it('should inherit properties of extended rulesets and disable not recommended ones', () => {
    return expect(readRulesFromRulesets(extendsUnspecifiedOas2Ruleset)).resolves.toEqual({
      ...[...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
        (rules, [name, rule]) => {
          rules[name] = {
            ...rule,
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

  it('should override properties of extended rulesets', () => {
    return expect(readRulesFromRulesets(extendsOas2WithOverrideRuleset)).resolves.toHaveProperty(
      'operation-2xx-response',
      {
        description: 'should be overridden',
        given: '$.info',
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

  it('should persists disabled properties of extended rulesets', () => {
    return expect(readRulesFromRulesets(extendsOas2WithOverrideRuleset)).resolves.toHaveProperty(
      'operation-security-defined',
      {
        given: '$',
        recommended: true,
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

  it('given non-existent ruleset should output error', () => {
    return expect(readRulesFromRulesets('oneParentRuleset')).rejects.toThrowError(
      'Could not parse https://unpkg.com/oneParentRuleset: Not Found',
    );
  });

  it('given invalid ruleset should output errors', () => {
    return expect(readRulesFromRulesets(invalidRuleset)).rejects.toThrowError(/should have required property/);
  });
});
