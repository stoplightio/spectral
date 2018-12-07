import { oas2Functions, oas2Rules } from '../rulesets/oas2';
import { oas3Functions, oas3Rules } from '../rulesets/oas3';
import { Spectral } from '../spectral';
import { RuleType } from '../types';
import * as petstoreV2 from './fixtures/petstore.oas2.json';
import * as petstoreV3 from './fixtures/petstore.oas3.json';

const invalidV2 = require('./fixtures/todos.invalid.oas2.json');
const oas2Ruleset = {
  functions: oas2Functions(),
  rules: oas2Rules(),
};
const oas3Ruleset = {
  functions: oas3Functions(),
  rules: oas3Rules(),
};

describe('validation', () => {
  test('validate a correct OASv2 spec', () => {
    const s = new Spectral();
    s.setFunctions(oas2Ruleset.functions || {});
    s.setRules(oas2Ruleset.rules);
    const result = s.run(petstoreV2, { format: 'oas2', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(0);
  });

  test('return errors on invalid OASv2 spec', () => {
    const s = new Spectral();
    s.setFunctions(oas2Ruleset.functions || {});
    s.setRules(oas2Ruleset.rules);
    const result = s.run(invalidV2, { format: 'oas2', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(1);
    expect(result.results[0].path).toEqual(['$', 'info', 'license', 'name']);
    expect(result.results[0].message).toEqual('should be string');
  });

  test('validate a correct OASv3 spec', () => {
    const s = new Spectral();
    s.setFunctions(oas3Ruleset.functions || {});
    s.setRules(oas3Ruleset.rules);
    const result = s.run(petstoreV3, { format: 'oas3', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(0);
  });

  test('validate multiple formats with same validator', () => {
    const s = new Spectral();
    s.setFunctions(oas2Ruleset.functions || {});
    s.setRules(oas2Ruleset.rules);
    s.mergeFunctions(oas3Ruleset.functions || {});
    s.mergeRules(oas3Ruleset.rules);

    let result = s.run(petstoreV2, { format: 'oas2', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(0);

    result = s.run(invalidV2, { format: 'oas2', type: RuleType.VALIDATION });
    expect(result.results).toMatchSnapshot();

    result = s.run(petstoreV3, { format: 'oas3', type: RuleType.VALIDATION });
    expect(result.results.length).toEqual(0);
  });
});
