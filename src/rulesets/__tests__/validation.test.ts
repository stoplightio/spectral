import { assertValidRuleset } from '../validation';
const invalidRuleset = require('./__fixtures__/invalid-ruleset.json');
const validRuleset = require('./__fixtures__/valid-ruleset.json');

describe('Ruleset Validation', () => {
  it('given invalid ruleset should throw', () => {
    expect(assertValidRuleset.bind(null, invalidRuleset)).toThrow();
  });

  it('given valid ruleset should emit no errors', () => {
    expect(assertValidRuleset.bind(null, validRuleset)).not.toThrow();
  });

  it('recognizes severity flags', () => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: 'off',
        },
      }),
    ).not.toThrow();
  });

  it('recognizes array-ish syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: ['off'],
        },
      }),
    ).not.toThrow();
  });

  it('recognizes invalid array-ish syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: ['off', 2],
        },
      }),
    ).toThrow();
  });

  it('recognizes valid array-ish extends syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        extends: [['foo', 'off'], 'test'],
        rules: {},
      }),
    ).not.toThrow();
  });

  it('recognizes invalid array-ish extends syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        extends: [['foo', 'test']],
        rules: {},
      }),
    ).toThrow();
  });
});
