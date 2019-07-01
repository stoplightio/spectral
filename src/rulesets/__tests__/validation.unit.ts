import { assertValidRuleset } from '../validation';
const invalidRuleset = require('./__fixtures__/ruleset-invalid.json');
const validRuleset = require('./__fixtures__/valid-ruleset.json');

describe('Ruleset Validation', () => {
  it('given invalid ruleset should throw', () => {
    expect(assertValidRuleset.bind(null, invalidRuleset)).toThrow('Provided ruleset is not valid');
  });

  it('given valid ruleset should emit no errors', () => {
    expect(assertValidRuleset.bind(null, validRuleset)).not.toThrow();
  });
});
