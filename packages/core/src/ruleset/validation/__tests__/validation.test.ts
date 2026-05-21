import '@stoplight/spectral-test-utils/matchers';

import { assertValidRuleset, RulesetValidationError } from '../index';
import AggregateError = require('es-aggregate-error');
import invalidRuleset from './__fixtures__/invalid-ruleset';
import validRuleset from './__fixtures__/valid-flat-ruleset';
import extendedRuleset from './__fixtures__/aliases/extended-definition';
import aliasCollisionRuleset from './__fixtures__/aliases/extended-alias-collision';
import tupleExtendedRuleset from './__fixtures__/aliases/tuple-extended';

import type { Format } from '../../format';
import { RulesetDefinition, RulesetOverridesDefinition } from '../../types';

const formatA: Format = () => false;
const formatB: Format = () => false;

function truthy() {
  // no-op
}

describe('JS Ruleset Validation', () => {
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
    expect(assertValidRuleset.bind(null, invalidRuleset)).toThrowAggregateError(
      new AggregateError([
        new RulesetValidationError(
          'invalid-rule-definition',
          'the rule must have at least "given" and "then" properties',
          ['rules', 'no-given-no-then'],
        ),
        new RulesetValidationError('invalid-rule-definition', 'allowed types are "style" and "validation"', [
          'rules',
          'rule-with-invalid-enum',
          'type',
        ]),
        new RulesetValidationError(
          'invalid-severity',
          'the value has to be one of: 0, 1, 2, 3 or "error", "warn", "info", "hint", "off"',
          ['rules', 'rule-with-invalid-enum', 'severity'],
        ),
      ]),
    );
  });

  it('given valid ruleset should, emits no errors', () => {
    expect(assertValidRuleset.bind(null, validRuleset)).not.toThrow();
  });

  it('given valid ruleset extending ruleset with alias should, emits no errors', () => {
    expect(assertValidRuleset.bind(null, extendedRuleset)).not.toThrow();
  });

  it('given valid ruleset extending rulesets with alias collision should, emits no errors', () => {
    expect(assertValidRuleset.bind(null, aliasCollisionRuleset)).not.toThrow();
  });

  it('given valid ruleset extending a ruleset with aliases using tuple [ruleset, severity] form, emits no errors', () => {
    expect(assertValidRuleset.bind(null, tupleExtendedRuleset)).not.toThrow();
  });

  it.each([false, 2, null, 'foo', '12.foo.com'])(
    'given invalid %s documentationUrl in a rule, throws',
    documentationUrl => {
      expect(assertValidRuleset.bind(null, { documentationUrl, rules: {} })).toThrowAggregateError(
        new AggregateError([
          new RulesetValidationError('generic-validation-error', 'must be a valid URL', ['documentationUrl']),
        ]),
      );

      expect(
        assertValidRuleset.bind(null, {
          rules: {
            rule: {
              documentationUrl,
              given: '$',
              then: {
                function: truthy,
              },
            },
          },
        }),
      ).toThrowAggregateError(
        new AggregateError([
          new RulesetValidationError('invalid-rule-definition', 'must be a valid URL', [
            'rules',
            'rule',
            'documentationUrl',
          ]),
        ]),
      );
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
            given: '$',
            then: {
              function: truthy,
            },
          },
        },
      }),
    ).not.toThrow();
  });

  it('allows x- extensions on a ruleset', () => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {},
        'x-internal': true,
        'x-vars': {
          foo: 'bar',
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
              function: truthy,
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

  it.each<[unknown, RulesetValidationError[]]>([
    [
      [[{ rules: {} }, 'test']],
      [
        new RulesetValidationError('invalid-extend-definition', 'allowed types are "off", "recommended" and "all"', [
          'extends',
          '0',
          '1',
        ]),
      ],
    ],
    [
      [[{ rules: {} }, 'test'], 'foo'],
      [
        new RulesetValidationError('invalid-extend-definition', 'must be a valid ruleset', ['extends', '1']),
        new RulesetValidationError('invalid-extend-definition', 'allowed types are "off", "recommended" and "all"', [
          'extends',
          '0',
          '1',
        ]),
      ],
    ],
  ])('recognizes invalid array-ish extends syntax %p', (_extends, errors) => {
    expect(
      assertValidRuleset.bind(null, {
        extends: _extends,
      }),
    ).toThrowAggregateError(new AggregateError(errors));
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
      new AggregateError([
        new RulesetValidationError('invalid-format', 'must be a valid format', ['formats', '0']),
        new RulesetValidationError('invalid-format', 'must be a valid format', ['formats', '1']),
      ]),
    ],
    [
      2,
      new AggregateError([
        new RulesetValidationError('invalid-ruleset-definition', 'must be an array of formats', ['formats']),
      ]),
    ],
    [
      [''],
      new AggregateError([new RulesetValidationError('invalid-format', 'must be a valid format', ['formats', '0'])]),
    ],
  ])('recognizes invalid ruleset %p formats syntax', (formats, error) => {
    expect(
      assertValidRuleset.bind(null, {
        formats,
        rules: {},
      }),
    ).toThrowAggregateError(error);
  });

  it('recognizes valid rule formats syntax', () => {
    expect(
      assertValidRuleset.bind(null, {
        formats: [formatB],
        rules: {
          rule: {
            given: '$.info',
            then: {
              function: truthy,
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
      new AggregateError([
        new RulesetValidationError('invalid-format', 'must be a valid format', ['rules', 'rule', 'formats', '0']),
        new RulesetValidationError('invalid-format', 'must be a valid format', ['rules', 'rule', 'formats', '1']),
      ]),
    ],
    [
      2,
      new AggregateError([
        new RulesetValidationError('invalid-rule-definition', 'must be an array of formats', [
          'rules',
          'rule',
          'formats',
        ]),
      ]),
    ],
  ])('recognizes invalid rule %p formats syntax', (formats, error) => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: {
            given: '$.info',
            then: {
              function: truthy,
            },
            formats,
          },
        },
      }),
    ).toThrowAggregateError(error);
  });

  describe('overrides validation', () => {
    it('given an invalid overrides, throws', () => {
      expect(
        assertValidRuleset.bind(null, {
          overrides: null,
        }),
      ).toThrowAggregateError(
        new AggregateError([new RulesetValidationError('invalid-ruleset-definition', 'must be array', ['overrides'])]),
      );
    });

    it('given an empty overrides, throws', () => {
      expect(
        assertValidRuleset.bind(null, {
          overrides: [],
        }),
      ).toThrowAggregateError(
        new AggregateError([
          new RulesetValidationError('invalid-override-definition', 'must not be empty', ['overrides']),
        ]),
      );
    });

    it('given an invalid pattern, throws', () => {
      expect(
        assertValidRuleset.bind(null, {
          overrides: [2],
        }),
      ).toThrowAggregateError(
        new AggregateError([
          new RulesetValidationError(
            'invalid-override-definition',
            'must be an override, i.e. { "files": ["v2/**/*.json"], "rules": {} }',
            ['overrides', '0'],
          ),
        ]),
      );
    });

    describe('pointers', () => {
      const rulesetA = {
        rules: {},
      };

      it.each<[Partial<RulesetDefinition>, RulesetValidationError]>([
        [
          { extends: [rulesetA] },
          new RulesetValidationError(
            'invalid-override-definition',
            'must contain rules when JSON Pointers are defined',
            ['overrides', '0'],
          ),
        ],
        [
          { formats: [formatB] },
          new RulesetValidationError(
            'invalid-override-definition',
            'must contain rules when JSON Pointers are defined',
            ['overrides', '0'],
          ),
        ],
        [
          { rules: {}, formats: [formatB] },
          new RulesetValidationError(
            'invalid-override-definition',
            'must not override any other property than rules when JSON Pointers are defined',
            ['overrides', '0'],
          ),
        ],
        [
          { rules: {}, extends: [rulesetA] },
          new RulesetValidationError(
            'invalid-override-definition',
            'must not override any other property than rules when JSON Pointers are defined',
            ['overrides', '0'],
          ),
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
          new RulesetValidationError(
            'invalid-rule-definition',
            'the value has to be one of: 0, 1, 2, 3 or "error", "warn", "info", "hint", "off"',
            ['overrides', '0', 'rules', 'definition'],
          ),
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
        ).toThrowAggregateError(new AggregateError([error]));
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
              [alias]: ['$'],
            },
          }),
        ).not.toThrow();
      },
    );

    it.each(['#Info', '#Info.contact', '#Info[*]'])('recognizes %s as a valid value of an alias', value => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {},
          aliases: {
            Info: ['$'],
            alias: [value],
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
      ).toThrowAggregateError(
        new AggregateError([new RulesetValidationError('invalid-ruleset-definition', 'must be object', ['aliases'])]),
      );
    });

    it.each([null, 5])('recognizes %p as an invalid type of aliases', value => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {},
          aliases: {
            alias: [value],
          },
        }),
      ).toThrowAggregateError(
        new AggregateError([
          new RulesetValidationError(
            'invalid-alias-definition',
            'must be a valid JSON Path expression or a reference to the existing Alias optionally paired with a JSON Path expression subset',
            ['aliases', 'alias', '0'],
          ),
        ]),
      );
    });

    it.each(['$', '#', '$bar', '9a', 'test!'])('given %s keyword used as a key of an alias, throws', key => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {},
          aliases: {
            [key]: ['$.foo'],
          },
        }),
      ).toThrowAggregateError(
        new AggregateError([
          new RulesetValidationError(
            'invalid-alias-definition',
            'to avoid confusion the name must match /^[A-Za-z][A-Za-z0-9_-]*$/ regular expression',
            ['aliases'],
          ),
        ]),
      );
    });

    it.each<[unknown[], RulesetValidationError[]]>([
      [
        [''],
        [
          new RulesetValidationError(
            'invalid-alias-definition',
            'must be a valid JSON Path expression or a reference to the existing Alias optionally paired with a JSON Path expression subset',
            ['aliases', 'PathItem', '0'],
          ),
        ],
      ],
      [
        ['foo'],
        [
          new RulesetValidationError(
            'invalid-alias-definition',
            'must be a valid JSON Path expression or a reference to the existing Alias optionally paired with a JSON Path expression subset',
            ['aliases', 'PathItem', '0'],
          ),
        ],
      ],
      [
        [],
        [
          new RulesetValidationError('invalid-alias-definition', 'must be a non-empty array of expressions', [
            'aliases',
            'PathItem',
          ]),
        ],
      ],
      [
        [0],
        [
          new RulesetValidationError(
            'invalid-alias-definition',
            'must be a valid JSON Path expression or a reference to the existing Alias optionally paired with a JSON Path expression subset',
            ['aliases', 'PathItem', '0'],
          ),
        ],
      ],
    ])('given %s value used as an alias, throws', (value, errors) => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {},
          aliases: {
            PathItem: value,
          },
        }),
      ).toThrowAggregateError(new AggregateError(errors));
    });

    describe('given scoped aliases', () => {
      it('demands targets to be present', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {},
            aliases: {
              alias: {},
            },
          }),
        ).toThrowAggregateError(
          new AggregateError([
            new RulesetValidationError(
              'invalid-alias-definition',
              'targets must be present and have at least a single alias definition',
              ['aliases', 'alias'],
            ),
          ]),
        );
      });

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
                      given: ['$.definitions[*]'],
                    },
                  ],
                },
              },
            }),
          ).not.toThrow();
        },
      );

      it.each(['#Info', '#Info.contact', '#Info[*]'])('recognizes %s as a valid value of an alias', value => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              a: {
                given: '#alias',
                then: {
                  function: truthy,
                },
              },
            },
            aliases: {
              Info: {
                targets: [
                  {
                    formats: [formatA],
                    given: ['$'],
                  },
                ],
              },
              alias: {
                targets: [
                  {
                    formats: [formatA],
                    given: [value],
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
        ).toThrowAggregateError(
          new AggregateError([
            new RulesetValidationError('invalid-alias-definition', 'must be array', [
              'aliases',
              'SchemaObject',
              'targets',
            ]),
          ]),
        );
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
        ).toThrowAggregateError(
          new AggregateError([
            new RulesetValidationError(
              'invalid-alias-definition',
              'targets must have at least a single alias definition',
              ['aliases', 'SchemaObject', 'targets'],
            ),
          ]),
        );
      });

      it.each([{}, { formats: [] }, { given: ['$'] }])('demands given & formats to be present', targets => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {},
            aliases: {
              SchemaObject: {
                targets: [targets],
              },
            },
          }),
        ).toThrowAggregateError(
          new AggregateError([
            new RulesetValidationError(
              'invalid-alias-definition',
              'a valid target must contain given and non-empty formats',
              ['aliases', 'SchemaObject', 'targets', '0'],
            ),
          ]),
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
                    given: ['$.definitions[*]'],
                  },
                  {
                    formats: [formatA, 'formatB'],
                    given: ['$.components.schemas[*]'],
                  },
                ],
              },
            },
          }),
        ).toThrowAggregateError(
          new AggregateError([
            new RulesetValidationError('invalid-format', 'must be a valid format', [
              'aliases',
              'SchemaObject',
              'targets',
              '0',
              'formats',
              '0',
            ]),
            new RulesetValidationError('invalid-format', 'must be a valid format', [
              'aliases',
              'SchemaObject',
              'targets',
              '1',
              'formats',
              '1',
            ]),
          ]),
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
                    given: ['$.definitions[*]'],
                  },
                  {
                    formats: [formatA, formatB],
                    given: ['!.components.schemas[*]'],
                  },
                ],
              },
            },
          }),
        ).toThrowAggregateError(
          new AggregateError([
            new RulesetValidationError(
              'invalid-given-definition',
              'must be a valid JSON Path expression or a reference to the existing Alias optionally paired with a JSON Path expression subset',
              ['aliases', 'SchemaObject', 'targets', '1', 'given', '0'],
            ),
          ]),
        );
      });
    });
  });

  describe('then validation', () => {
    it('given undefined function, throws', () => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {
            rule: {
              given: '$',
              then: {
                function: void 0,
              },
            },
          },
        }),
      ).toThrowAggregateError(
        new AggregateError([
          new RulesetValidationError('undefined-function', 'Function is not defined', [
            'rules',
            'rule',
            'then',
            'function',
          ]),
        ]),
      );
    });

    it('given valid then, does not complain', () => {
      expect(
        assertValidRuleset.bind(null, {
          rules: {
            rule: {
              given: '$',
              then: {
                function: truthy,
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
                function: truthy,
              },
            },
          },
        }),
      ).not.toThrow();
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
        new AggregateError([
          new RulesetValidationError(
            'invalid-parser-options-definition',
            'the value has to be one of: 0, 1, 2, 3 or "error", "warn", "info", "hint", "off"',
            ['parserOptions', 'duplicateKeys'],
          ),
          new RulesetValidationError(
            'invalid-parser-options-definition',
            'the value has to be one of: 0, 1, 2, 3 or "error", "warn", "info", "hint", "off"',
            ['parserOptions', 'incompatibleValues'],
          ),
        ]),
      );
    });
  });

  it('allows x- extensions on a rule', () => {
    expect(
      assertValidRuleset.bind(null, {
        rules: {
          rule: {
            given: '$',
            then: {
              field: 'test',
              function: truthy,
            },
            'x-internal': true,
            'x-vars': {
              foo: 'bar',
            },
          },
        },
      }),
    ).not.toThrow();
  });

  describe('nested extends alias validation', () => {
    it('given a rule in nested extends using an alias defined in that nested ruleset, emits no errors', () => {
      const innerRuleset = {
        aliases: {
          ArrayProperties: ['$.paths[*]'],
        },
        rules: {
          'my-nested-rule': {
            given: '#ArrayProperties',
            then: { function: truthy },
          },
        },
      };

      const middleRuleset = {
        extends: [innerRuleset],
        rules: {
          'override-rule': 'error' as const,
        },
      };

      expect(
        assertValidRuleset.bind(null, {
          extends: [middleRuleset],
        }),
      ).not.toThrow();
    });

    it('given a rule in nested extends with severity on first level using an alias defined in that nested ruleset, emits no errors', () => {
      const innerRuleset = {
        aliases: {
          ArrayProperties: ['$.paths[*]'],
        },
        rules: {
          'my-nested-rule': {
            given: '#ArrayProperties',
            then: { function: truthy },
          },
        },
      };

      const middleRuleset = {
        extends: [[innerRuleset, 'all'] as [object, 'all']],
        rules: {
          'override-rule': 'error' as const,
        },
      };

      expect(
        assertValidRuleset.bind(null, {
          extends: [middleRuleset],
        }),
      ).not.toThrow();
    });

    it('given a rule in nested extends with severity on second level using an alias defined in that nested ruleset, emits no errors', () => {
      const innerRuleset = {
        aliases: {
          ArrayProperties: ['$.paths[*]'],
        },
        rules: {
          'my-nested-rule': {
            given: '#ArrayProperties',
            then: { function: truthy },
          },
        },
      };

      const middleRuleset = {
        extends: [innerRuleset],
        rules: {
          'override-rule': 'error' as const,
        },
      };

      expect(
        assertValidRuleset.bind(null, {
          extends: [[middleRuleset, 'all'] as [object, 'all']],
        }),
      ).not.toThrow();
    });

    it('given a rule in nested extends with severity on all level using an alias defined in that nested ruleset, emits no errors', () => {
      const innerRuleset = {
        aliases: {
          ArrayProperties: ['$.paths[*]'],
        },
        rules: {
          'my-nested-rule': {
            given: '#ArrayProperties',
            then: { function: truthy },
          },
        },
      };

      const middleRuleset = {
        extends: [[innerRuleset, 'all'] as [object, 'all']],
        rules: {
          'override-rule': 'error' as const,
        },
      };

      expect(
        assertValidRuleset.bind(null, {
          extends: [[middleRuleset, 'all'] as [object, 'all']],
        }),
      ).not.toThrow();
    });

    it('given a rule in nested extends where alias exists only in a deeper nested ruleset, emits no errors', () => {
      // Mirrors the OWASP scenario: root → customRules (no aliases) → owaspRuleset (has aliases)
      const owaspRuleset = {
        aliases: {
          ArrayProperties: ['$.paths[*][get,post,put,patch,delete,options,head]'],
        },
        rules: {
          'owasp:api4:2019-array-limit': {
            given: '#ArrayProperties',
            then: { function: truthy },
          },
        },
      };

      const customRules = {
        extends: [owaspRuleset],
        rules: {
          'owasp:api4:2019-array-limit': 'error' as const,
        },
      };

      expect(
        assertValidRuleset.bind(null, {
          extends: [customRules],
        }),
      ).not.toThrow();
    });

    it('given a rule in nested extends using alias defined in middle ruleset (not nested), emits no errors', () => {
      // Middle ruleset defines the alias; nested ruleset rule references it via inheritance
      const innerRuleset = {
        rules: {
          'inner-rule': {
            given: '#SharedAlias',
            then: { function: truthy },
          },
        },
      };

      const ruleset = {
        aliases: {
          SharedAlias: ['$.info'],
        },
        extends: [innerRuleset],
      };

      expect(
        assertValidRuleset.bind(null, {
          extends: [ruleset],
        }),
      ).not.toThrow();
    });

    it('given a rule in nested extends using an undefined alias, throws', () => {
      const innerRuleset = {
        aliases: {
          ArrayProperties: ['$.paths[*]'],
        },
        rules: {
          'my-nested-rule': {
            given: '#UndefinedAlias',
            then: { function: truthy },
          },
        },
      };

      const ruleset = {
        extends: [innerRuleset],
      };

      expect(
        assertValidRuleset.bind(null, {
          extends: [ruleset],
        }),
      ).toThrowAggregateError(
        new AggregateError([
          new RulesetValidationError('undefined-alias', 'Alias "UndefinedAlias" does not exist', [
            'extends',
            '0',
            'extends',
            '0',
            'rules',
            'my-nested-rule',
            'given',
          ]),
        ]),
      );
    });

    it('given three levels of nested extends, resolves aliases from the deepest level without crashing', () => {
      // Verifies that the recursive getExtended logic handles 3+ levels of nesting
      // without "Cannot read property of undefined" errors
      const deepRuleset = {
        aliases: {
          DeepAlias: ['$.paths[*]'],
        },
        rules: {
          'deep-rule': {
            given: '#DeepAlias',
            then: { function: truthy },
          },
        },
      };

      const innerRuleset = {
        extends: [deepRuleset],
      };

      const middleRuleset = {
        extends: [innerRuleset],
      };

      const topRuleset = {
        extends: [middleRuleset],
      };

      expect(
        assertValidRuleset.bind(null, {
          extends: [topRuleset],
        }),
      ).not.toThrow();
    });

    it('given extends with empty nested extends array, does not crash when resolving aliases', () => {
      const ruleset = {
        extends: [] as object[],
        aliases: {
          TopLevelAlias: ['$.info'],
        },
        rules: {
          'top-level-rule': {
            given: '#TopLevelAlias',
            then: { function: truthy },
          },
        },
      };

      expect(
        assertValidRuleset.bind(null, {
          extends: [ruleset],
        }),
      ).not.toThrow();
    });
  });
});

// we only check the most notable differences here, since the rest of the validation process is common to both JS and JSON
describe('JSON Ruleset Validation', () => {
  it('recognizes valid array-ish extends syntax', () => {
    expect(
      assertValidRuleset.bind(
        null,
        {
          extends: [['rulesetA', 'off'], 'rulesetB'],
          rules: {},
        },
        'json',
      ),
    ).not.toThrow();
  });

  it.each<[unknown, RulesetValidationError[]]>([
    [
      [['test', 'test']],
      [
        new RulesetValidationError('invalid-extend-definition', 'allowed types are "off", "recommended" and "all"', [
          'extends',
          '0',
          '1',
        ]),
      ],
    ],
    [
      [['bar', 'test'], {}],
      [
        new RulesetValidationError('invalid-extend-definition', 'must be string', ['extends', '1']),
        new RulesetValidationError('invalid-extend-definition', `allowed types are "off", "recommended" and "all"`, [
          'extends',
          '0',
          '1',
        ]),
      ],
    ],
  ])('recognizes invalid array-ish extends syntax %p', (_extends, errors) => {
    expect(
      assertValidRuleset.bind(
        null,
        {
          extends: _extends,
        },
        'json',
      ),
    ).toThrowAggregateError(new AggregateError(errors));
  });

  it('recognizes valid ruleset formats syntax', () => {
    expect(
      assertValidRuleset.bind(
        null,
        {
          formats: ['oas2'],
          rules: {},
        },
        'json',
      ),
    ).not.toThrow();
  });

  it.each<[unknown, RulesetValidationError[]]>([
    [
      [2, null],
      [
        new RulesetValidationError('invalid-format', 'must be a valid format', ['formats', '0']),
        new RulesetValidationError('invalid-format', 'must be a valid format', ['formats', '1']),
      ],
    ],
    [2, [new RulesetValidationError('invalid-ruleset-definition', 'must be an array of formats', ['formats'])]],
    [[null], [new RulesetValidationError('invalid-format', 'must be a valid format', ['formats', '0'])]],
  ])('recognizes invalid ruleset %p formats syntax', (formats, errors) => {
    expect(
      assertValidRuleset.bind(
        null,
        {
          formats,
          rules: {},
        },
        'json',
      ),
    ).toThrowAggregateError(new AggregateError(errors));
  });

  it('recognizes valid rule formats syntax', () => {
    expect(
      assertValidRuleset.bind(
        null,
        {
          formats: ['json-schema-loose'],
          rules: {
            rule: {
              given: '$.info',
              then: {
                function: 'truthy',
              },
              formats: ['oas2'],
            },
          },
        },
        'json',
      ),
    ).not.toThrow();
  });

  it.each<[unknown, RulesetValidationError[]]>([
    [
      [2, null],
      [
        new RulesetValidationError('invalid-format', 'must be a valid format', ['rules', 'rule', 'formats', '0']),
        new RulesetValidationError('invalid-format', 'must be a valid format', ['rules', 'rule', 'formats', '1']),
      ],
    ],
    [
      2,
      [
        new RulesetValidationError('invalid-rule-definition', 'must be an array of formats', [
          'rules',
          'rule',
          'formats',
        ]),
      ],
    ],
  ])('recognizes invalid rule %p formats syntax', (formats, errors) => {
    expect(
      assertValidRuleset.bind(
        null,
        {
          rules: {
            rule: {
              given: '$.info',
              then: {
                function: 'truthy',
              },
              formats,
            },
          },
        },
        'json',
      ),
    ).toThrowAggregateError(new AggregateError(errors));
  });
});

describe('Ruleset Validation source context', () => {
  it('attaches range and source to validation errors when sourceContext is provided', () => {
    const sourceContext = {
      source: '/tmp/ruleset.yaml',
      getLocationForJsonPath(jsonPath: ReadonlyArray<string | number>) {
        if (jsonPath.join('/') === 'rules/rule-with-invalid-enum/severity') {
          return { range: { start: { line: 7, character: 14 }, end: { line: 7, character: 22 } } };
        }
        return undefined;
      },
    };

    let caught: AggregateError | undefined;
    try {
      assertValidRuleset(invalidRuleset, 'js', sourceContext);
    } catch (e) {
      caught = e as AggregateError;
    }

    expect(caught).toBeInstanceOf(AggregateError);

    const severityError = (caught as AggregateError).errors.find(
      (e: RulesetValidationError) => e.code === 'invalid-severity',
    ) as RulesetValidationError;
    expect(severityError.source).toBe('/tmp/ruleset.yaml');
    expect(severityError.range).toEqual({
      start: { line: 7, character: 14 },
      end: { line: 7, character: 22 },
    });

    const otherError = (caught as AggregateError).errors.find(
      (e: RulesetValidationError) => e.code !== 'invalid-severity',
    ) as RulesetValidationError;
    expect(otherError.source).toBe('/tmp/ruleset.yaml');
    expect(otherError.range).toBeUndefined();
  });

  it('attaches source to early-throw errors when sourceContext is provided', () => {
    const sourceContext = {
      source: '/tmp/ruleset.yaml',
      getLocationForJsonPath() {
        return { range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } } };
      },
    };

    expect(() => assertValidRuleset(null, 'js', sourceContext)).toThrow(
      expect.objectContaining({
        code: 'invalid-ruleset-definition',
        source: '/tmp/ruleset.yaml',
      }),
    );

    expect(() => assertValidRuleset({}, 'js', sourceContext)).toThrow(
      expect.objectContaining({
        code: 'invalid-ruleset-definition',
        source: '/tmp/ruleset.yaml',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      }),
    );
  });

  it('leaves range and source undefined when sourceContext is omitted', () => {
    let caught: AggregateError | undefined;
    try {
      assertValidRuleset(invalidRuleset, 'js');
    } catch (e) {
      caught = e as AggregateError;
    }

    expect(caught).toBeInstanceOf(AggregateError);
    for (const e of (caught as AggregateError).errors as RulesetValidationError[]) {
      expect(e.source).toBeUndefined();
      expect(e.range).toBeUndefined();
    }
  });
});
