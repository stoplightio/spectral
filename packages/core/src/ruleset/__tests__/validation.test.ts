import { schema, truthy } from '@stoplight/spectral-functions';
import { Format } from '../format';
import { assertValidRuleset, RulesetValidationError } from '../validation';
import { RulesetDefinition, RulesetOverridesDefinition } from '../types';
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
    expect(assertValidRuleset.bind(null, {})).toThrow('Ruleset must have rules or extends or overrides defined');
    expect(assertValidRuleset.bind(null, { rule: {} })).toThrow(
      'Ruleset must have rules or extends or overrides defined',
    );
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

  it.each([false, 2, null])('given invalid %s description in a ruleset, throws', description => {
    expect(assertValidRuleset.bind(null, { description, rules: {} })).toThrow(
      new RulesetValidationError('Error at #/description: must be string'),
    );
  });

  it('recognizes valid description in a ruleset', () => {
    expect(
      assertValidRuleset.bind(null, {
        description: 'This is the ruleset description',
        rules: {},
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

  describe('overrides validation', () => {
    it('given an invalid overrides, throws', () => {
      expect(
        assertValidRuleset.bind(null, {
          overrides: null,
        }),
      ).toThrow(new RulesetValidationError('Error at #/overrides: must be array'));
    });

    it('given an empty overrides, throws', () => {
      expect(
        assertValidRuleset.bind(null, {
          overrides: [],
        }),
      ).toThrow(new RulesetValidationError('Error at #/overrides: must not be empty'));
    });

    it('given an invalid pattern, throws', () => {
      expect(
        assertValidRuleset.bind(null, {
          overrides: [2],
        }),
      ).toThrow(
        new RulesetValidationError(
          'Error at #/overrides/0: must be a override, i.e. { "files": ["v2/**/*.json"], "rules": {} }',
        ),
      );
    });

    describe('pointers', () => {
      const rulesetA = {
        rules: {},
      };

      it.each<[Partial<RulesetDefinition>, string]>([
        [{ extends: [rulesetA] }, 'Error at #/overrides/0: must contain rules when JSON Pointers are defined'],
        [{ formats: [formatB] }, 'Error at #/overrides/0: must contain rules when JSON Pointers are defined'],
        [
          { rules: {}, formats: [formatB] },
          'Error at #/overrides/0: must not override any other property than rules when JSON Pointers are defined',
        ],
        [
          { rules: {}, extends: [rulesetA] },
          'Error at #/overrides/0: must not override any other property than rules when JSON Pointers are defined',
        ],
        [
          {
            rules: {
              definition: {
                given: '$',
                then: {
                  function: truthy,
                },
              },
            },
          },
          'Error at #/overrides/0/rules/definition: the value has to be one of: 0, 1, 2, 3 or "error", "warn", "info", "hint", "off"',
        ],
      ])('given an override containing a pointer and %p, throws', (ruleset, error) => {
        expect(
          assertValidRuleset.bind(null, {
            overrides: [
              {
                files: ['./bar#'],
                ...ruleset,
              },
            ],
          }),
        ).toThrow(new RulesetValidationError(error));
      });

      it.each<RulesetOverridesDefinition>([
        [
          {
            files: ['*.json#'],
            rules: {
              'my-rule': 'error',
            },
          },
        ],
        [
          {
            files: ['*.json#/test'],
            rules: {},
          },
        ],
      ])('recognizes a valid %p override', (...ruleset) => {
        expect(
          assertValidRuleset.bind(null, {
            overrides: ruleset,
          }),
        ).not.toThrow();
      });
    });
  });

  describe('aliases validation', () => {
    it.each(['Info', 'Info-Description', 'Info_Description', 'Response404', 'errorMessage'])(
      'recognizes %s as a valid key of an alias',
      alias => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {},
            aliases: {
              [alias]: '$',
            },
          }),
        ).not.toThrow();
      },
    );

    it.each(['#Info', '#i', '#Info.contact', '#Info[*]'])('recognizes %s as a valid value of an alias', alias => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {},
          aliases: {
            alias,
          },
        }),
      ).not.toThrow();
    });

    it('given an invalid aliases, throws', () => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {},
          aliases: null,
        }),
      ).toThrow(new RulesetValidationError('Error at #/aliases: must be object'));
    });

    it.each([null, 5, [], {}])('recognizes %p as an invalid type of aliases', alias => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {},
          aliases: {
            alias,
          },
        }),
      ).toThrow(
        new RulesetValidationError(
          'Error at #/aliases/alias: the value of an alias must be a valid JSON Path expression, a reference to the existing Alias optionally paired with a JSON Path expression subset, or contain a valid set of targets',
        ),
      );
    });

    it.each(['$', '#', '$bar', '9a', 'test!'])('given %s keyword used as a key of an alias, throws', key => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {},
          aliases: {
            [key]: '$.foo',
          },
        }),
      ).toThrow(
        new RulesetValidationError(
          'Error at #/aliases: to avoid confusion the name must match /^[A-Za-z][A-Za-z0-9_-]*$/ regular expression',
        ),
      );
    });

    it.each(['', 'foo'])('given %s value used as an alias, throws', value => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {},
          aliases: {
            PathItem: value,
          },
        }),
      ).toThrow(
        new RulesetValidationError(
          'Error at #/aliases/PathItem: the value of an alias must be a valid JSON Path expression or a reference to the existing Alias optionally paired with a JSON Path expression subset',
        ),
      );
    });

    describe('given scoped aliases', () => {
      it.each(['Info', 'Info-Description', 'Info_Description', 'Response404', 'errorMessage'])(
        'recognizes %s as a valid key of an alias',
        alias => {
          expect(
            assertValidRuleset.bind(null, {
              rules: {},
              aliases: {
                [alias]: {
                  targets: [
                    {
                      formats: [formatA],
                      given: '$.definitions[*]',
                    },
                  ],
                },
              },
            }),
          ).not.toThrow();
        },
      );

      it.each(['#Info', '#i', '#Info.contact', '#Info[*]'])('recognizes %s as a valid value of an alias', alias => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {},
            aliases: {
              alias: {
                targets: [
                  {
                    formats: [formatA],
                    given: alias,
                  },
                ],
              },
            },
          }),
        ).not.toThrow();
      });

      it.each([null, 1, {}, 'a'])('recognizes %p as invalid targets', targets => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {},
            aliases: {
              SchemaObject: {
                targets,
              },
            },
          }),
        ).toThrow(new RulesetValidationError('Error at #/aliases/SchemaObject/targets: must be array'));
      });

      it('demands some target', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {},
            aliases: {
              SchemaObject: {
                targets: [],
              },
            },
          }),
        ).toThrow(
          new RulesetValidationError(
            'Error at #/aliases/SchemaObject/targets: targets must have at least a single alias definition',
          ),
        );
      });

      it.each([{}, { formats: [] }, { given: '$' }])('demands given & formats to be present', targets => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {},
            aliases: {
              SchemaObject: {
                targets: [targets],
              },
            },
          }),
        ).toThrow(
          new RulesetValidationError(
            'Error at #/aliases/SchemaObject/targets/0: a valid target must contain given and non-empty formats',
          ),
        );
      });

      it('recognizes invalid formats', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {},
            aliases: {
              SchemaObject: {
                targets: [
                  {
                    formats: [2],
                    given: '$.definitions[*]',
                  },
                  {
                    formats: [formatA, 'formatB'],
                    given: '$.components.schemas[*]',
                  },
                ],
              },
            },
          }),
        ).toThrow(
          new RulesetValidationError(
            `Error at #/aliases/SchemaObject/targets/0/formats/0: must be a valid format
Error at #/aliases/SchemaObject/targets/1/formats/1: must be a valid format`,
          ),
        );
      });

      it('recognizes invalid given', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {},
            aliases: {
              SchemaObject: {
                targets: [
                  {
                    formats: [formatA],
                    given: '#.definitions[*]',
                  },
                  {
                    formats: [formatA, formatB],
                    given: '!.components.schemas[*]',
                  },
                ],
              },
            },
          }),
        ).toThrow(
          new RulesetValidationError(
            `Error at #/aliases/SchemaObject/targets/1/given: the value of an alias must be a valid JSON Path expression or a reference to the existing Alias optionally paired with a JSON Path expression subset`,
          ),
        );
      });
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
