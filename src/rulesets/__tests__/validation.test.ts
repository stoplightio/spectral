import { assertValidRuleset } from '../validation';
const invalidRuleset = require('./__fixtures__/invalid-ruleset.json');
const validRuleset = require('./__fixtures__/valid-flat-ruleset.json');

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var it: jest.It;

describe('Ruleset Validation', () => {
  it('given primitive type should throw', () => {
    expect(assertValidRuleset.bind(null, null)).toThrow();
    expect(assertValidRuleset.bind(null, 2)).toThrow();
    expect(assertValidRuleset.bind(null, 'true')).toThrow();
  });

  it('given object with no rules property should throw', () => {
    expect(assertValidRuleset.bind(null, {})).toThrow();
    expect(assertValidRuleset.bind(null, { rule: {} })).toThrow();
  });

  it('given invalid ruleset should throw', () => {
    expect(assertValidRuleset.bind(null, invalidRuleset)).toThrow();
  });

  it('given valid ruleset should emit no errors', () => {
    expect(assertValidRuleset.bind(null, validRuleset)).not.toThrow();
  });

  it.each(['error', 'warn', 'info', 'hint', 'off'])('recognizes human-readable %s severity', severity => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: severity,
        },
      }),
    ).not.toThrow();

    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: {
            given: '$.info',
            then: {
              function: 'truthy',
            },
            severity,
          },
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

    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: [1],
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

  it('recognizes string extends syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        extends: 'foo',
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

  it('recognizes valid ruleset formats syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        formats: ['oas3'],
        rules: {},
      }),
    ).not.toThrow();
  });

  it.each([[2, 'a'], 2, ['']])('recognizes invalid ruleset formats syntax', formats => {
    expect(
      assertValidRuleset.bind(null, {
        formats,
        rules: {},
      }),
    ).toThrow();
  });

  it('recognizes valid rule formats syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        formats: ['d'],
        rules: {
          rule: {
            given: '$.info',
            then: {
              function: 'truthy',
            },
            formats: ['oas2'],
          },
        },
      }),
    ).not.toThrow();
  });

  it.each([[2, 'a'], 2, ['']])('recognizes invalid rule formats syntax', formats => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          given: '$.info',
          then: {
            function: 'truthy',
          },
          formats,
        },
      }),
    ).toThrow();
  });
});
