import { JSONSchema7 } from 'json-schema';
import { assertValidRuleset, decorateIFunctionWithSchemaValidation, ValidationError } from '../validation';
const invalidRuleset = require('./__fixtures__/invalid-ruleset.json');
const validRuleset = require('./__fixtures__/valid-flat-ruleset.json');

describe('Ruleset Validation', () => {
  it('given primitive type should throw', () => {
    expect(assertValidRuleset.bind(null, null)).toThrow('Provided ruleset is not an object');
    expect(assertValidRuleset.bind(null, 2)).toThrow('Provided ruleset is not an object');
    expect(assertValidRuleset.bind(null, 'true')).toThrow('Provided ruleset is not an object');
  });

  it('given object with no rules and no extends properties should throw', () => {
    expect(assertValidRuleset.bind(null, {})).toThrow('Ruleset must have rules or extends property');
    expect(assertValidRuleset.bind(null, { rule: {} })).toThrow('Ruleset must have rules or extends property');
  });

  it('given object with extends property only should emit no errors', () => {
    expect(assertValidRuleset.bind(null, { extends: [] })).not.toThrow();
  });

  it('given object with rules property only should emit no errors', () => {
    expect(assertValidRuleset.bind(null, { rules: {} })).not.toThrow();
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
        functions: [
          ['foo', {}],
          ['baz', {}],
        ],
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

  describe('Exceptions validation', () => {
    const rulesetsWithInvalidExceptStructures = [
      { extends: ['foo'], except: '' },
      { extends: ['foo'], except: { one: null } },
      { extends: ['foo'], except: { one: [1] } },
    ];

    it.each(rulesetsWithInvalidExceptStructures)('throws when defined "except" do not match schema', ruleset => {
      expect(() => {
        assertValidRuleset(ruleset);
      }).toThrow(ValidationError);
    });
  });
});

describe('Function Validation', () => {
  it('throws if options supplied to fn does not meet schema', () => {
    const schema: JSONSchema7 = { type: 'string' };
    const wrapped = decorateIFunctionWithSchemaValidation(jest.fn(), schema);
    expect(() => wrapped({}, 2, { given: [] }, { original: [], given: [] } as any)).toThrow(ValidationError);
  });

  it('does not call supplied fn if options do not meet schema', () => {
    const schema: JSONSchema7 = { type: 'string' };
    const fn = jest.fn();
    const wrapped = decorateIFunctionWithSchemaValidation(fn, schema);
    try {
      wrapped({}, 2, { given: [] }, { original: [], given: [] } as any);
    } catch {
      // will throw
    }

    expect(fn).not.toHaveBeenCalled();
    expect(() => wrapped({}, {}, { given: [] }, { original: [], given: [] } as any)).toThrow(ValidationError);
  });

  it('calls supplied fn and passes all other arguments if options do match schema', () => {
    const schema: JSONSchema7 = { type: 'string' };
    const fn = jest.fn();
    const wrapped = decorateIFunctionWithSchemaValidation(fn, schema);
    wrapped({}, '2', { given: [] }, { original: [], given: [] } as any);

    expect(fn).toHaveBeenCalledWith({}, '2', { given: [] }, { original: [], given: [] });
  });
});
