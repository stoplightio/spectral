import { oas2Ruleset } from '../rulesets/oas2';
import { oas3Ruleset } from '../rulesets/oas3';
import { Spectral } from '../spectral.new';
import { RuleType } from '../types';
import * as petstoreV2 from './fixtures/petstore.oas2.json';
import * as petstoreV3 from './fixtures/petstore.oas3.json';

const invalidV2 = require('./fixtures/todos.invalid.oas2.json');

describe('validation', () => {
  test('validate a correct OASv2 spec', () => {
    const s = new Spectral();
    s.setFunctions(oas2Ruleset().functions || {});
    s.newSetRules(oas2Ruleset().rules);
    const result = s.run(petstoreV2, { format: 'oas2', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(0);
  });

  test('return errors on invalid OASv2 spec', () => {
    const s = new Spectral();
    s.setFunctions(oas2Ruleset().functions || {});
    s.newSetRules(oas2Ruleset().rules);
    const result = s.run(invalidV2, { format: 'oas2', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(1);
    expect(result.results[0].path).toEqual(['$', 'info', 'license', 'name']);
    expect(result.results[0].message).toEqual('should be string');
  });

  test('validate a correct OASv3 spec', () => {
    const s = new Spectral();
    s.setFunctions(oas3Ruleset().functions || {});
    s.newSetRules(oas3Ruleset().rules);
    const result = s.run(petstoreV3, { format: 'oas3', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(0);
  });

  test('validate multiple formats with same validator', () => {
    const s = new Spectral();
    s.setFunctions(oas2Ruleset().functions || {});
    s.newSetRules(oas2Ruleset().rules);
    s.mergeFunctions(oas3Ruleset().functions || {});
    s.newUpdateRules(oas3Ruleset().rules);

    let result = s.run(petstoreV2, { format: 'oas2', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(0);

    result = s.run(invalidV2, { format: 'oas2', type: RuleType.VALIDATION });
    expect(result.results).toMatchSnapshot();

    result = s.run(petstoreV3, { format: 'oas3', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(0);
  });
});
