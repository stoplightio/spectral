import { JSONSchema7 } from 'json-schema';
import { assertValidRuleset, decorateIFunctionWithSchemaValidation, ValidationError } from '../validation';
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
    expect(assertValidRuleset.bind(null, invalidRuleset)).toThrow(ValidationError);
  });

  it('given valid ruleset should, emits no errors', () => {
    expect(assertValidRuleset.bind(null, validRuleset)).not.toThrow();
  });

  it.each([false, 2, null, 'foo', '12.foo.com'])('given invalid %s documentationUrl, throws', documentationUrl => {
    expect(assertValidRuleset.bind(null, { documentationUrl, rules: {} })).toThrow(ValidationError);
  });

  it('recognizes valid documentationUrl', () => {
    expect(
      assertValidRuleset.bind(null, {
        documentationUrl: 'https://stoplight.io/p/docs/gh/stoplightio/spectral/docs/reference/openapi-rules.md',
        extends: ['spectral:oas'],
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

  describe('then validation', () => {
    describe.each([
      'casing',
      'enumeration',
      'length',
      'pattern',
      'schema',
      'schema-path',
      'unreferencedReusableObject',
      'xor',
    ])('%s function', name => {
      it('complains about empty options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: name,
                  functionOptions: {},
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it('complains about missing options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: name,
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it('complains about nullified options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: name,
                  functionOptions: null,
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });
    });

    describe.each(['truthy', 'falsy', 'undefined'])('%s function', name => {
      it('given valid then, does not complain', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: name,
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
                  function: name,
                },
              },
            },
          }),
        ).not.toThrow();
      });

      it('complains about the presence of functionOptions', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: name,
                  functionOptions: {},
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });
    });

    describe('alphabetical function', () => {
      it('given valid then, does not complain', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'alphabetical',
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
                  function: 'alphabetical',
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
                  function: 'alphabetical',
                  functionOptions: {
                    keyedBy: 'bar',
                  },
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
                  function: 'alphabetical',
                  functionOptions: null,
                },
              },
            },
          }),
        ).not.toThrow();
      });

      it('does not complain about empty functionOptions', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'alphabetical',
                  functionOptions: {},
                },
              },
            },
          }),
        ).not.toThrow(ValidationError);
      });

      it('complains about extra options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'alphabetical',
                  functionOptions: {
                    foo: true,
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it('complains about invalid keyedBy', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'alphabetical',
                  functionOptions: {
                    keyedBy: 2,
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });
    });

    describe('casing function', () => {
      it.each([
        { type: 'cobol' },
        { type: 'macro', disallowDigits: true },
        { type: 'snake', disallowDigits: true, separator: { char: 'a' } },
        { type: 'pascal', disallowDigits: false, separator: { char: 'b', allowLeading: true } },
      ])('given valid then %s', functionOptions => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'casing',
                  functionOptions,
                },
              },
            },
          }),
        ).not.toThrow();
      });

      it.each([
        { type: 'macro', foo: true },
        { type: 'snake', separator: { char: 'a', foo: true } },
      ])('complains about extra options %s', functionOptions => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'casing',
                  functionOptions,
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it('complains about invalid type', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'casing',
                  functionOptions: {
                    type: 'foo',
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it('complains about missing char', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'casing',
                  functionOptions: {
                    type: 'pascal',
                    disallowDigits: false,
                    separator: {},
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);

        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'casing',
                  functionOptions: {
                    type: 'pascal',
                    disallowDigits: false,
                    separator: { allowLeading: true },
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it('complains about too length char', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'casing',
                  functionOptions: {
                    type: 'pascal',
                    separator: {
                      char: 'fo',
                    },
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it('complains about too invalid char', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'casing',
                  functionOptions: {
                    type: 'pascal',
                    separator: {
                      char: null,
                    },
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });
    });

    describe('enumeration function', () => {
      it('given valid then, does not complain', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'enumeration',
                  functionOptions: {
                    values: ['foo', 2],
                  },
                },
              },
            },
          }),
        ).not.toThrow();
      });

      it('complains about extra options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'enumeration',
                  functionOptions: {
                    values: ['foo', 2],
                    foo: true,
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it.each([[null], 2, null])('complains about invalid values %s', functionOptions => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'enumeration',
                  functionOptions,
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });
    });

    describe('length function', () => {
      it.each([{ min: 2 }, { max: 4 }, { min: 2, max: 4 }])('given valid then %s', functionOptions => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'length',
                  functionOptions,
                },
              },
            },
          }),
        ).not.toThrow();
      });

      it('complains about extra options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'length',
                  functionOptions: {
                    min: 2,
                    foo: true,
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it.each([{ min: '2' }, { max: '2' }, { min: '4', max: '2' }])(
        'complains about invalid options %s',
        functionOptions => {
          expect(
            assertValidRuleset.bind(null, {
              rules: {
                rule: {
                  given: '$',
                  then: {
                    function: 'length',
                    functionOptions,
                  },
                },
              },
            }),
          ).toThrow(ValidationError);
        },
      );
    });

    describe('pattern function', () => {
      it.each([{ match: 'foo' }, { notMatch: 'foo' }, { match: 'foo', notMatch: 'bar' }])(
        'given valid then %s',
        functionOptions => {
          expect(
            assertValidRuleset.bind(null, {
              rules: {
                rule: {
                  given: '$',
                  then: {
                    function: 'pattern',
                    functionOptions,
                  },
                },
              },
            }),
          ).not.toThrow();
        },
      );

      it('complains about extra options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'pattern',
                  functionOptions: {
                    match: 'foo',
                    foo: true,
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it.each([{ match: 2 }, { notMatch: null }, { match: 4, notMatch: 'bar' }])(
        'complains about invalid options %s',
        functionOptions => {
          expect(
            assertValidRuleset.bind(null, {
              rules: {
                rule: {
                  given: '$',
                  then: {
                    function: 'pattern',
                    functionOptions,
                  },
                },
              },
            }),
          ).toThrow(ValidationError);
        },
      );
    });

    describe('schema function', () => {
      it.each([
        { schema: { type: 'object' } },
        { schema: { type: 'string' }, oasVersion: 2 },
        { schema: { type: 'string' }, allErrors: true },
        { schema: { type: 'string' }, oasVersion: 3.1, allErrors: false },
      ])('given valid then %s', functionOptions => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'schema',
                  functionOptions,
                },
              },
            },
          }),
        ).not.toThrow();
      });

      it('complains about extra options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'schema',
                  functionOptions: {
                    schema: { type: 'object' },
                    foo: true,
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it.each([
        { schema: { type: 'object' }, oasVersion: 1 },
        { schema: { type: 'object' }, allErrors: null },
        { schema: null, allErrors: null },
      ])('complains about invalid options %s', functionOptions => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'schema',
                  functionOptions,
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });
    });

    describe('unreferencedReusableObject function', () => {
      it('given valid then, does not complain', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'unreferencedReusableObject',
                  functionOptions: {
                    reusableObjectsLocation: '#',
                  },
                },
              },
            },
          }),
        ).not.toThrow();
      });

      it('complains about extra options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'unreferencedReusableObject',
                  functionOptions: {
                    reusableObjectsLocation: 'foo',
                    foo: true,
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it.each([2, '', 'd'])('complains about invalid options %s', reusableObjectsLocation => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'unreferencedReusableObject',
                  functionOptions: {
                    reusableObjectsLocation,
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });
    });

    describe('xor function', () => {
      it('given valid then, does not complain', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'xor',
                  functionOptions: {
                    properties: ['foo', 'bar'],
                  },
                },
              },
            },
          }),
        ).not.toThrow();
      });

      it('complains about extra options', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'xor',
                  functionOptions: {
                    properties: ['foo', 2],
                    foo: true,
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it('complains about too few properties', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'xor',
                  functionOptions: {
                    properties: ['foo'],
                  },
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });

      it.each([[null], 2, null])('complains about invalid properties %s', functionOptions => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'xor',
                  functionOptions,
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });
    });

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

      it('complains about non-object functionOptions', () => {
        expect(
          assertValidRuleset.bind(null, {
            rules: {
              rule: {
                given: '$',
                then: {
                  function: 'foo',
                  functionOptions: true,
                },
              },
            },
          }),
        ).toThrow(ValidationError);
      });
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
