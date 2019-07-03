import { assertValidRuleset } from '../validation';
const invalidRuleset = require('./__fixtures__/ruleset-invalid.json');
const validRuleset = require('./__fixtures__/valid-ruleset.json');

describe('Ruleset Validation', () => {
  it('given invalid ruleset should throw', () => {
    expect(assertValidRuleset.bind(null, invalidRuleset)).toThrow(
      [
        "/rules/no-given-no-then should have required property 'given'",
        "/rules/no-given-no-then should have required property 'then'",
        '/rules/rule-with-invalid-enum/severity should be number',
        '/rules/rule-with-invalid-enum/severity should be equal to one of the allowed values',
        '/rules/rule-with-invalid-enum/type should be equal to one of the allowed values',
      ].join('\n'),
    );
  });

  it('given valid ruleset should emit no errors', () => {
    expect(assertValidRuleset.bind(null, validRuleset)).not.toThrow();
  });
});
