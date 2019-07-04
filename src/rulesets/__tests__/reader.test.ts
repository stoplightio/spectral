import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types/dist';
import * as path from 'path';
import { readRulesFromRulesets } from '../reader';

const validFlatRuleset = path.join(__dirname, './__fixtures__/valid-flat-ruleset.json');
const validFlatRuleset2 = path.join(__dirname, './__fixtures__/valid-flat-ruleset.yaml');
const invalidRuleset = path.join(__dirname, './__fixtures__/invalid-ruleset.json');
const validRuleset = path.join(__dirname, './__fixtures__/valid-ruleset.json');
const validRuleset2 = path.join(__dirname, './__fixtures__/valid-ruleset-2.json');
const oasRuleset = require('../oas/index.json');
const oas2Ruleset = require('../oas2/index.json');

describe('Rulesets reader', () => {
  it('given flat, valid ruleset file should return rules', async () => {
    expect(await readRulesFromRulesets(validFlatRuleset)).toEqual({
      'valid-rule': {
        given: '$.info',
        summary: 'should be OK',
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
        summary: 'should be OK',
        then: {
          function: 'truthy',
        },
      },
      'valid-rule-2': {
        given: '$.info',
        summary: 'should be OK',
        then: {
          function: 'truthy',
        },
      },
    });
  });

  it('should inherit properties of extended rulesets', () => {
    return expect(readRulesFromRulesets(validRuleset)).resolves.toEqual({
      ...[...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
        (rules, [name, rule]) => {
          rules[name] = {
            ...rule,
            severity: expect.any(Number),
          };

          return rules;
        },
        {},
      ),

      'valid-rule': {
        given: '$.info',
        summary: 'should be OK',
        then: {
          function: 'truthy',
        },
      },
    });
  });

  it('should override properties of extended rulesets', async () => {
    const result = await readRulesFromRulesets(validRuleset2);
    expect(result).not.toHaveProperty('operation-security-defined');
    expect(result).toHaveProperty('operation-2xx-response', {
      summary: 'should be OK',
      given: '$.info',
      recommended: true,
      severity: DiagnosticSeverity.Error,
      tags: ['operation'],
      then: {
        field: 'responses',
        function: 'truthy',
      },
      type: 'style',
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
