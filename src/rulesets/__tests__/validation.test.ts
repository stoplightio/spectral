import { JSONSchema7 } from 'json-schema';
import { assertValidRuleset, ValidationError, wrapIFunctionWithSchema } from '../validation';
const invalidRuleset = require('./__fixtures__/invalid-ruleset.json');
const validRuleset = require('./__fixtures__/valid-flat-ruleset.json');

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var it: jest.It;

describe('Ruleset Validation', () => {
  it('given primitive type should throw', () => {
    expect(assertValidRuleset.bind(null, null)).toThrow('Provided ruleset is not an object');
    expect(assertValidRuleset.bind(null, 2)).toThrow('Provided ruleset is not an object');
    expect(assertValidRuleset.bind(null, 'true')).toThrow('Provided ruleset is not an object');
  });

  it('given object with no rules property should throw', () => {
    expect(assertValidRuleset.bind(null, {})).toThrow('Ruleset must have rules property');
    expect(assertValidRuleset.bind(null, { rule: {} })).toThrow('Ruleset must have rules property');
  });

  it('given invalid ruleset should throw', () => {
    expect(assertValidRuleset.bind(null, invalidRuleset)).toThrow(ValidationError);
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
    ).toThrow(ValidationError);
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
    ).toThrow(ValidationError);
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
    ).toThrow(ValidationError);
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
    ).toThrow(ValidationError);
  });

  it('recognizes functions directory', () => {
    expect(
      assertValidRuleset.bind(null, {
        functionsDir: 'baz',
        rules: {},
      }),
    ).not.toThrow();
  });

  it('recognizes invalid functions directory', () => {
    expect(
      assertValidRuleset.bind(null, {
        functionsDir: 2,
        rules: {},
      }),
    ).toThrow(ValidationError);
  });

  it('recognizes valid array of functions with names only', () => {
    expect(
      assertValidRuleset.bind(null, {
        functions: ['foo', 'bar'],
        rules: {},
      }),
    ).not.toThrow();
  });

  it('recognizes valid array of functions with object only', () => {
    expect(
      assertValidRuleset.bind(null, {
        functions: [['foo', {}], ['baz', {}]],
        rules: {},
      }),
    ).not.toThrow();
  });

  it('recognizes valid array of functions with both names and objects only', () => {
    expect(
      assertValidRuleset.bind(null, {
        functions: ['falsy', ['foo', {}], ['baz', {}], 'truthy'],
        rules: {},
      }),
    ).not.toThrow();
  });

  it('recognizes valid schema functions', () => {
    expect(
      assertValidRuleset.bind(null, {
        functions: [['d', { type: 'object' }]],
        rules: {},
      }),
    ).not.toThrow();
  });

  it('recognizes invalid functions', () => {
    expect(
      assertValidRuleset.bind(null, {
        functions: 3,
        rules: {},
      }),
    ).toThrow(ValidationError);
  });

  it('recognizes invalid schema functions', () => {
    expect(
      assertValidRuleset.bind(null, {
        functions: ['d', { typo: 'a' }],
        rules: {},
      }),
    ).toThrow(ValidationError);
  });

  it('recognizes invalid functions options', () => {
    expect(
      assertValidRuleset.bind(null, {
        functions: [3, 'd'],
        rules: {},
      }),
    ).toThrow(ValidationError);
  });
});

describe('Function Validation', () => {
  it('throws if options supplied to fn does not meet schema', () => {
    const schema: JSONSchema7 = { type: 'string' };
    const wrapped = wrapIFunctionWithSchema(Function, schema);
    expect(() => wrapped({}, 2)).toThrow(ValidationError);
  });

  it('does not call supplied fn if options do not meet schema', () => {
    const schema: JSONSchema7 = { type: 'string' };
    const fn = jest.fn();
    const wrapped = wrapIFunctionWithSchema(fn, schema);
    try {
      wrapped({}, 2);
    } catch {
      // will throw
    }

    expect(fn).not.toHaveBeenCalled();
    expect(() => wrapped({}, 2)).toThrow(ValidationError);
  });

  it('calls supplied fn and passes all other arguments if options do not match schema', () => {
    const schema: JSONSchema7 = { type: 'string' };
    const fn = jest.fn();
    const wrapped = wrapIFunctionWithSchema(fn, schema);
    wrapped({}, '2', true, 1, []);

    expect(fn).toHaveBeenCalledWith({}, '2', true, 1, []);
  });
});
