import { validateRuleset } from '../validation';
const invalidRuleset = require('./__fixtures__/ruleset-invalid.json');
const validRuleset = require('./__fixtures__/valid-ruleset.json');

describe('Ruleset Validation', () => {
  it('given invalid ruleset should emit errors', () => {
    expect(JSON.stringify(validateRuleset(invalidRuleset), null, 2)).toMatchSnapshot();
  });

  it('given valid ruleset should emit no errors', () => {
    expect(validateRuleset(validRuleset)).toEqual([]);
  });
});
