import { assertValidRuleset, RulesetValidationError } from '../validation';
const invalidRuleset = require('./__fixtures__/invalid-ruleset.json');
const validRuleset = require('./__fixtures__/valid-flat-ruleset.json');

describe('Ruleset Validation', () => {
  it('given primitive type, throws', () => {
    expect(assertValidRuleset.bind(null, null)).toThrow('Provided ruleset is not an object');
    expect(assertValidRuleset.bind(null, 2)).toThrow('Provided ruleset is not an object');
    expect(assertValidRuleset.bind(null, 'true')).toThrow('Provided ruleset is not an object');
  });

  it('given object with no rules and no extends properties, throws', () => {
    expect(assertValidRuleset.bind(null, {})).toThrow('Ruleset must have rules or extends property');
    expect(assertValidRuleset.bind(null, { rule: {} })).toThrow('Ruleset must have rules or extends property');
  });

  it('given object with extends property only, emits no errors', () => {
    expect(assertValidRuleset.bind(null, { extends: [] })).not.toThrow();
  });

  it('given object with rules property only, emits no errors', () => {
    expect(assertValidRuleset.bind(null, { rules: {} })).not.toThrow();
  });

  it('given invalid ruleset, throws', () => {
    expect(assertValidRuleset.bind(null, invalidRuleset)).toThrow(
      new RulesetValidationError(`Error at #/rules/no-given-no-then: the rule must have at least "given" and "then" properties
Error at #/rules/rule-with-invalid-enum/type: allowed types are "style" and "validation"
Error at #/rules/rule-with-invalid-enum/severity: the value has to be one of: 0, 1, 2, 3 or "error", "warn", "info", "hint", "off"`),
    );
  });

  it('given valid ruleset should, emits no errors', () => {
    expect(assertValidRuleset.bind(null, validRuleset)).not.toThrow();
  });

  it.each([false, 2, null, 'foo', '12.foo.com'])(
    'given invalid %s documentationUrl in a rule, throws',
    documentationUrl => {
      expect(assertValidRuleset.bind(null, { documentationUrl, rules: {} })).toThrow(
        new RulesetValidationError('Error at #/documentationUrl: must be a valid URL'),
      );

      expect(
        assertValidRuleset.bind(null, {
          rules: {
            rule: {
              documentationUrl,
              given: '$',
              then: {
                function: '',
              },
            },
          },
        }),
      ).toThrow(new RulesetValidationError('Error at #/rules/rule/documentationUrl: must be a valid URL'));
    },
  );

  it('recognizes valid documentationUrl', () => {
    expect(
      assertValidRuleset.bind(null, {
        documentationUrl: 'https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/openapi-rules.md',
        extends: ['spectral:oas'],
      }),
    ).not.toThrow();

    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: {
            documentationUrl: 'https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/openapi-rules.md',
            given: '',
            then: {
              function: '',
            },
          },
        },
      }),
    ).not.toThrow();
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

  it('recognizes invalid array-ish syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: ['off', 2],
        },
      }),
    ).toThrow(
      new RulesetValidationError(
        'Error at #/rules/rule: the rule has to have at least "given" and "then". If you intent to override the severity of extended rule, the value must to be a boolean or any valid severity level',
      ),
    );
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
    ).toThrow(
      new RulesetValidationError(`Error at #/extends/0: must be string
Error at #/extends/0/1: allowed types are "off", "recommended" and "all"`),
    );
  });

  it('recognizes valid ruleset formats syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        formats: ['oas3'],
        rules: {},
      }),
    ).not.toThrow();
  });

  it.each([
    [[2, 'a'], 'Error at #/formats/0: format must be a string'],
    [2, 'Error at #/formats: formats must be an array of strings'],
    [[''], 'Error at #/formats/0: format must not be empty'],
  ])('recognizes invalid ruleset %p formats syntax', (formats, error) => {
    expect(
      assertValidRuleset.bind(null, {
        formats,
        rules: {},
      }),
    ).toThrow(new RulesetValidationError(error));
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

  it.each([
    [[2, 'a'], 'Error at #/rules/rule/formats/0: format must be a string'],
    [2, 'Error at #/rules/rule/formats: formats must be an array of strings'],
    [[''], 'Error at #/rules/rule/formats/0: format must not be empty'],
  ])('recognizes invalid rule %p formats syntax', (formats, error) => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: {
            given: '$.info',
            then: {
              function: 'truthy',
            },
            formats,
          },
        },
      }),
    ).toThrow(new RulesetValidationError(error));
  });

  it('recognizes functions directory', () => {
    expect(
      assertValidRuleset.bind(null, {
        functionsDir: 'baz',
        rules: {},
      }),
    ).not.toThrow();
  });

  it('recognizes valid array of functions with names only', () => {
    expect(
      assertValidRuleset.bind(null, {
        functions: ['foo', 'bar'],
        rules: {},
      }),
    ).not.toThrow();
  });

  describe('Exceptions validation', () => {
    const rulesetsWithInvalidExceptStructures = [
      { extends: ['foo'], except: '' },
      { extends: ['foo'], except: { one: null } },
      { extends: ['foo'], except: { one: [1] } },
    ];

    it.each(rulesetsWithInvalidExceptStructures)('throws when defined %p "except" do not match schema', ruleset => {
      expect(() => {
        assertValidRuleset(ruleset);
      }).toThrow(
        new RulesetValidationError(
          'Error at #/except: must be a map where each key is either a path or a path+json-pointer or a json-pointer and the value is an array of rules',
        ),
      );
    });
  });

  describe('then validation', () => {
    describe('custom function', () => {
      it('given valid then, does not complain', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'foo',
                },
              },
            },
          }),
        ).not.toThrow();

        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  field: 'test',
                  function: 'foo',
                },
              },
            },
          }),
        ).not.toThrow();
      });
    });
  });

  describe('parser options validation', () => {
    it('recognizes valid options', () => {
      expect(
        assertValidRuleset.bind(null, {
          extends: [],
          parserOptions: {
            incompatibleValues: 'warn',
          },
        }),
      ).not.toThrow();

      expect(
        assertValidRuleset.bind(null, {
          extends: [],
          parserOptions: {
            incompatibleValues: 2,
            duplicateKeys: 'hint',
          },
        }),
      ).not.toThrow();
    });

    it('given invalid values, throws', () => {
      expect(
        assertValidRuleset.bind(null, {
          extends: [],
          parserOptions: {
            incompatibleValues: 5,
            duplicateKeys: 'foo',
          },
        }),
      ).toThrow(
        new RulesetValidationError(`Error at #/parserOptions/duplicateKeys: the value has to be one of: 0, 1, 2, 3 or "error", "warn", "info", "hint", "off"
Error at #/parserOptions/incompatibleValues: the value has to be one of: 0, 1, 2, 3 or "error", "warn", "info", "hint", "off"`),
      );
    });
  });
});
