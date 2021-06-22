import { schema } from '@stoplight/spectral-functions';
import { Format } from '../format';
import { assertValidRuleset, RulesetValidationError } from '../validation';
const invalidRuleset = require('./__fixtures__/invalid-ruleset.json');
const validRuleset = require('./__fixtures__/valid-flat-ruleset.json');

const formatA: Format = () => false;
const formatB: Format = () => false;

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
        rules: {},
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

  it('recognizes valid array-ish extends syntax', () => {
    const rulesetA = {
      rules: {},
    };

    const rulesetB = {
      extends: [],
    };

    expect(
      assertValidRuleset.bind(null, {
        extends: [[rulesetA, 'off'], rulesetB],
        rules: {},
      }),
    ).not.toThrow();
  });

  it('recognizes string extends syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          foo: {
            given: '$',
            then: {
              function: schema,
              functionOptions: {},
            },
          },
        },
      }),
    ).not.toThrow();
  });

  it.each<[unknown, string]>([
    [[[{ rules: {} }, 'test']], `Error at #/extends/0/1: allowed types are "off", "recommended" and "all"`],
    [
      [[{ rules: {} }, 'test'], 'foo'],
      `Error at #/extends/1: must be a valid ruleset
Error at #/extends/0/1: allowed types are "off", "recommended" and "all"`,
    ],
  ])('recognizes invalid array-ish extends syntax %p', (_extends, message) => {
    expect(
      assertValidRuleset.bind(null, {
        extends: _extends,
      }),
    ).toThrow(new RulesetValidationError(message));
  });

  it('recognizes valid ruleset formats syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        formats: [formatB],
        rules: {},
      }),
    ).not.toThrow();
  });

  it.each([
    [
      [2, 'a'],
      `Error at #/formats/0: must be a valid format
Error at #/formats/1: must be a valid format`,
    ],
    [2, 'Error at #/formats: must be an array of formats'],
    [[''], 'Error at #/formats/0: must be a valid format'],
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
        formats: [formatB],
        rules: {
          rule: {
            given: '$.info',
            then: {
              function: 'truthy',
            },
            formats: [formatA],
          },
        },
      }),
    ).not.toThrow();
  });

  it.each([
    [
      [2, 'a'],
      `Error at #/rules/rule/formats/0: must be a valid format
Error at #/rules/rule/formats/1: must be a valid format`,
    ],
    [2, 'Error at #/rules/rule/formats: must be an array of formats'],
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
