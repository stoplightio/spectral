import { Resolver } from '@stoplight/json-ref-resolver';
import { DiagnosticSeverity } from '@stoplight/types';
import { parse } from '@stoplight/yaml';
import { IParsedResult } from '../document';
import { isOpenApiv2, isOpenApiv3 } from '../formats';
import { mergeRules, readRuleset } from '../rulesets';
import { RuleCollection, Spectral } from '../spectral';

const invalidSchema = JSON.stringify(require('./__fixtures__/petstore.invalid-schema.oas3.json'));
const studioFixture = JSON.stringify(require('./__fixtures__/studio-default-fixture-oas3.json'), null, 2);
const todosInvalid = JSON.stringify(require('./__fixtures__/todos.invalid.oas2.json'));
const petstoreMergeKeys = JSON.stringify(require('./__fixtures__/petstore.merge.keys.oas3.json'));

const fnName = 'fake';
const fnName2 = 'fake2';
const target = {
  responses: {
    200: {
      description: 'a',
    },
    201: {
      description: 'b',
    },
    300: {
      description: 'c',
    },
  },
};
const rules = {
  example: {
    message: '',
    given: '$.responses',
    then: {
      function: fnName,
    },
  },
};

describe('linter', () => {
  let spectral: Spectral;

  beforeEach(() => {
    spectral = new Spectral();
    spectral.registerFormat('oas2', isOpenApiv2);
    spectral.registerFormat('oas3', isOpenApiv3);
  });

  test('should not throw if passed in value is not an object', () => {
    const fakeLintingFunction = jest.fn();
    spectral.setFunctions({
      [fnName]: fakeLintingFunction,
    });
    spectral.setRules(rules);

    return expect(spectral.run('123')).resolves.toBeTruthy();
  });

  test('should return all properties matching 4xx response code', async () => {
    const message = '4xx responses require a description';

    spectral.setFunctions({
      func1: val => {
        if (!val) {
          return [
            {
              message,
            },
          ];
        }

        return;
      },
    });

    spectral.setRules({
      rule1: {
        given: '$.responses.[?(@property >= 400 && @property < 500)]',
        then: {
          field: 'description',
          function: 'func1',
        },
      },
    });

    const result = await spectral.run(
      {
        responses: {
          '200': {
            name: 'ok',
          },
          '404': {
            name: 'not found',
          },
        },
      },
      { ignoreUnknownFormat: true },
    );

    expect(result).toEqual([
      expect.objectContaining({
        code: 'rule1',
        message,
        severity: DiagnosticSeverity.Warning,
        path: ['responses', '404'],
        range: {
          end: {
            line: 6,
            character: 25,
          },
          start: {
            character: 10,
            line: 5,
          },
        },
      }),
    ]);
  });

  test('should support rule overriding severity', async () => {
    spectral.setFunctions({
      func1: () => {
        return [
          {
            message: 'foo',
          },
        ];
      },
    });

    spectral.setRules({
      rule1: {
        given: '$.x',
        severity: DiagnosticSeverity.Hint,
        then: {
          function: 'func1',
        },
      },
    });

    const result = await spectral.run(
      {
        x: true,
      },
      { ignoreUnknownFormat: true },
    );

    expect(result[0]).toHaveProperty('severity', DiagnosticSeverity.Hint);
  });

  test('should not report anything for disabled rules', async () => {
    await spectral.loadRuleset('spectral:oas');
    const { rules: oasRules } = await readRuleset('spectral:oas');
    spectral.setRules(
      mergeRules(oasRules, {
        'oas3-valid-schema-example': 'off',
        'operation-2xx-response': -1,
        'openapi-tags': 'off',
      }) as RuleCollection,
    );

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual([
      expect.objectContaining({
        code: 'oas3-schema',
        message: `\`200\` property should have required property \`$ref\``,
        path: ['paths', '/pets', 'get', 'responses', '200'],
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'oas3-unused-components-schema',
        message: 'Potentially unused components schema has been detected.',
        path: ['components', 'schemas', 'Pets'],
      }),
      expect.objectContaining({
        code: 'oas3-unused-components-schema',
        message: 'Potentially unused components schema has been detected.',
        path: ['components', 'schemas', 'foo'],
      }),
    ]);
  });

  test('should output unescaped json paths', async () => {
    await spectral.loadRuleset('spectral:oas');

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'oas3-schema',
          message: `\`200\` property should have required property \`$ref\``,
          path: ['paths', '/pets', 'get', 'responses', '200'],
        }),
      ]),
    );
  });

  test('should support human readable severity levels', async () => {
    spectral.setRules({
      rule1: {
        given: '$.x',
        severity: 'error',
        then: {
          function: 'truthy',
        },
      },
      rule2: {
        given: '$.y',
        severity: 'warn',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run(
      {
        x: false,
        y: '',
      },
      { ignoreUnknownFormat: true },
    );

    expect(result).toEqual([
      expect.objectContaining({
        code: 'rule1',
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: 'rule2',
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });

  test('should respect the format of data and run rules associated with it', async () => {
    spectral.registerFormat('foo-bar', obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj);

    spectral.setRules({
      rule1: {
        given: '$.x',
        formats: ['foo-bar'],
        severity: 'error',
        then: {
          function: 'truthy',
        },
      },
      rule2: {
        given: '$.y',
        formats: [],
        severity: 'warn',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run({
      'foo-bar': true,
      x: false,
      y: '',
    });

    expect(result).toEqual([
      expect.objectContaining({
        code: 'rule1',
      }),
    ]);
  });

  test('should match all formats if rule has no formats defined', async () => {
    spectral.registerFormat('foo-bar', obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj);

    spectral.setRules({
      rule1: {
        given: '$.x',
        formats: ['foo-bar'],
        severity: 'error',
        then: {
          function: 'truthy',
        },
      },
      rule2: {
        given: '$.y',
        severity: 'warn',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run({
      'foo-bar': true,
      x: false,
      y: '',
    });

    expect(result).toEqual([
      expect.objectContaining({
        code: 'rule1',
      }),
      expect.objectContaining({
        code: 'rule2',
      }),
    ]);
  });

  test('should not run any rule with defined formats if there are no formats registered', async () => {
    spectral.setRules({
      rule1: {
        given: '$.x',
        formats: ['foo-bar'],
        severity: 'error',
        then: {
          function: 'truthy',
        },
      },
      rule2: {
        formats: ['baz'],
        given: '$.y',
        severity: 'warn',
        then: {
          function: 'truthy',
        },
      },
      rule3: {
        given: '$.y',
        severity: 'warn',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run({
      'foo-bar': true,
      x: false,
      y: '',
    });

    expect(result).toEqual([
      expect.objectContaining({
        code: 'unrecognized-format',
        message: 'The provided document does not match any of the registered formats [oas2, oas3]',
      }),
      expect.objectContaining({
        code: 'rule3',
      }),
    ]);
  });

  test('should let a format lookup to be overridden', async () => {
    spectral.registerFormat('foo-bar', obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj);
    spectral.registerFormat('foo-bar', () => false);
    spectral.registerFormat('baz', () => true);

    spectral.setRules({
      rule1: {
        given: '$.x',
        formats: ['foo-bar'],
        severity: 'error',
        then: {
          function: 'truthy',
        },
      },
      rule2: {
        formats: ['foo-bar'],
        given: '$.y',
        severity: 'warn',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run({
      'foo-bar': true,
      x: false,
      y: '',
    });

    expect(result).toEqual([]);
  });

  test('should execute rules matching all found formats', async () => {
    spectral.registerFormat('foo-bar', obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj);
    spectral.registerFormat('baz', () => true);

    spectral.setRules({
      rule1: {
        given: '$.x',
        formats: ['foo-bar'],
        severity: 'error',
        then: {
          function: 'truthy',
        },
      },
      rule2: {
        formats: ['baz'],
        given: '$.y',
        severity: 'warn',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run({
      'foo-bar': true,
      x: false,
      y: '',
    });

    expect(result).toEqual([
      expect.objectContaining({
        code: 'rule1',
      }),
      expect.objectContaining({
        code: 'rule2',
      }),
    ]);
  });

  test('should not run any rule with defined formats if some formats are registered but document format could not be associated', async () => {
    spectral.registerFormat('foo-bar', obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj);

    spectral.setRules({
      rule1: {
        given: '$.x',
        formats: ['foo-bar'],
        severity: 'error',
        then: {
          function: 'truthy',
        },
      },
      rule2: {
        formats: ['baz'],
        given: '$.y',
        severity: 'warn',
        then: {
          function: 'truthy',
        },
      },
      rule3: {
        given: '$.y',
        severity: 'warn',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run({
      'bar-foo': true,
      x: false,
      y: '',
    });

    expect(result).toEqual([
      {
        message: 'The provided document does not match any of the registered formats [oas2, oas3, foo-bar]',
        path: [],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
        code: 'unrecognized-format',
      },
      expect.objectContaining({
        code: 'rule3',
      }),
    ]);
  });

  test('given a string input, should warn about unmatched formats', async () => {
    const result = await spectral.run('test');

    expect(result).toEqual([
      {
        code: 'unrecognized-format',
        message: 'The provided document does not match any of the registered formats [oas2, oas3]',
        path: [],
        range: {
          end: {
            character: 4,
            line: 0,
          },
          start: {
            character: 0,
            line: 0,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('given ignoreUnknownFormat, should not warn about unmatched formats', async () => {
    spectral.registerFormat('foo-bar', obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj);

    spectral.setRules({
      rule1: {
        given: '$.x',
        formats: ['foo-bar'],
        severity: 'error',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run(
      {
        'bar-foo': true,
        x: true,
        y: '',
      },
      { ignoreUnknownFormat: true },
    );

    expect(result).toEqual([]);
  });

  test('should include parser diagnostics', async () => {
    await spectral.loadRuleset('spectral:oas');

    const responses = `openapi: 2.0.0
responses:: !!foo
  400:
    description: a
  204:
    description: b
 200:
     description: c
`;

    const result = await spectral.run(responses);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          code: 'parser',
          message: 'Unknown tag <tag:yaml.org,2002:foo>',
          path: [],
          range: {
            end: {
              character: 17,
              line: 1,
            },
            start: {
              character: 12,
              line: 1,
            },
          },
          severity: 0,
        },
        {
          code: 'parser',
          message: 'Bad indentation of a mapping entry',
          path: [],
          range: {
            end: {
              character: 1,
              line: 6,
            },
            start: {
              character: 1,
              line: 6,
            },
          },
          severity: 0,
        },
      ]),
    );
  });

  test('should report a valid line number for json paths containing escaped slashes', async () => {
    spectral.registerFormat('oas2', isOpenApiv2);
    spectral.registerFormat('oas3', isOpenApiv3);
    await spectral.loadRuleset('spectral:oas');

    const result = await spectral.run(studioFixture);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'oas3-schema',
          path: ['paths', '/users', 'get', 'responses'],
          range: {
            end: {
              character: 23,
              line: 16,
            },
            start: {
              character: 20,
              line: 16,
            },
          },
        }),
      ]),
    );
  });

  test('should remove all redundant ajv errors', async () => {
    spectral.registerFormat('oas2', isOpenApiv2);
    spectral.registerFormat('oas3', isOpenApiv3);
    await spectral.loadRuleset('spectral:oas');

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual([
      expect.objectContaining({
        code: 'openapi-tags',
      }),
      expect.objectContaining({
        code: 'operation-tag-defined',
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: `\`200\` property should have required property \`$ref\``,
        path: ['paths', '/pets', 'get', 'responses', '200'],
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'oas3-unused-components-schema',
        message: 'Potentially unused components schema has been detected.',
        path: ['components', 'schemas', 'Pets'],
      }),
      expect.objectContaining({
        code: 'oas3-unused-components-schema',
        message: 'Potentially unused components schema has been detected.',
        path: ['components', 'schemas', 'foo'],
      }),
      expect.objectContaining({
        code: 'oas3-valid-schema-example',
        message: '`example` property type should be number',
        path: ['components', 'schemas', 'foo', 'example'],
      }),
    ]);
  });

  test('should report invalid schema $refs', async () => {
    spectral.registerFormat('oas2', isOpenApiv2);
    spectral.registerFormat('oas3', isOpenApiv3);
    await spectral.loadRuleset('spectral:oas');

    const result = await spectral.run(todosInvalid);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'oas2-valid-parameter-example',
          message: "can't resolve reference #/parameters/missing from id #",
          path: ['paths', '/todos/{todoId}', 'put', 'parameters', '1', 'schema', 'example'],
        }),
      ]),
    );
  });

  test('should report invalid $refs', async () => {
    await spectral.loadRuleset('spectral:oas');

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid-ref',
          message: "No resolver defined for scheme 'file' in ref ./models/pet.yaml",
          path: ['paths', '/pets', 'get', 'responses', '200', 'content', 'application/json', 'schema', '$ref'],
          severity: DiagnosticSeverity.Error,
        }),
        expect.objectContaining({
          code: 'invalid-ref',
          message: "No resolver defined for scheme 'file' in ref ../common/models/error.yaml",
          path: ['paths', '/pets', 'get', 'responses', 'default', 'content', 'application/json', 'schema', '$ref'],
          severity: DiagnosticSeverity.Error,
        }),
      ]),
    );
  });

  test('should support YAML merge keys', async () => {
    await spectral.loadRuleset('spectral:oas');
    spectral.setRules({
      'operation-tag-defined': {
        ...spectral.rules['operation-tag-defined'],
        severity: 'off',
      },
    });

    const result = await spectral.run(petstoreMergeKeys);

    expect(result).toEqual([]);
  });

  describe('reports duplicated properties for', () => {
    test('JSON format', async () => {
      const result = await spectral.run('{"foo":true,"foo":false}', { ignoreUnknownFormat: true });

      expect(result).toEqual([
        {
          code: 'parser',
          message: 'Duplicate key: foo',
          path: ['foo'],
          range: {
            end: {
              character: 17,
              line: 0,
            },
            start: {
              character: 12,
              line: 0,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
      ]);
    });

    test('YAML format', async () => {
      const result = await spectral.run(`foo: bar\nfoo: baz`, { ignoreUnknownFormat: true });

      expect(result).toEqual([
        {
          code: 'parser',
          message: 'Duplicate key: foo',
          path: ['foo'],
          range: {
            end: {
              character: 3,
              line: 1,
            },
            start: {
              character: 0,
              line: 1,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
      ]);
    });
  });

  test('should report invalid YAML mapping keys', async () => {
    const results = await spectral.run(
      `responses:
  200:
    description: ''
  '400':
    description: ''`,
      { ignoreUnknownFormat: true },
    );

    expect(results).toEqual([
      {
        code: 'parser',
        message: 'Mapping key must be a string scalar rather than number',
        path: ['responses', '200'],
        range: {
          end: {
            character: 5,
            line: 1,
          },
          start: {
            character: 2,
            line: 1,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  describe('functional tests for the given property', () => {
    let fakeLintingFunction: any;

    beforeEach(() => {
      fakeLintingFunction = jest.fn();
      spectral.setFunctions({
        [fnName]: fakeLintingFunction,
      });
      spectral.setRules(rules);
    });

    describe('when given path is set', () => {
      test('should pass given path through to lint function', async () => {
        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][2].given).toEqual(['responses']);
        expect(fakeLintingFunction.mock.calls[0][3].given).toEqual(target.responses);
      });

      test('given array of paths, should pass each given path through to lint function', async () => {
        spectral.setRules({
          example: {
            message: '',
            given: ['$.responses', '$..200'],
            then: {
              function: fnName,
            },
          },
        });

        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(2);
        expect(fakeLintingFunction.mock.calls[0][2].given).toEqual(['responses']);
        expect(fakeLintingFunction.mock.calls[0][3].given).toEqual(target.responses);
        expect(fakeLintingFunction.mock.calls[1][2].given).toEqual(['responses', '200']);
        expect(fakeLintingFunction.mock.calls[1][3].given).toEqual(target.responses['200']);
      });
    });

    describe('when given path is not set', () => {
      test('should pass through root object', async () => {
        spectral.setRules({
          example: {
            message: '',
            given: '$',
            then: {
              function: fnName,
            },
          },
        });
        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][2].given).toEqual([]);
        expect(fakeLintingFunction.mock.calls[0][3].given).toEqual(target);
      });
    });
  });

  describe('functional tests for the then statement', () => {
    let fakeLintingFunction: any;
    let fakeLintingFunction2: any;

    beforeEach(() => {
      fakeLintingFunction = jest.fn();
      fakeLintingFunction2 = jest.fn();
      spectral.setFunctions({
        [fnName]: fakeLintingFunction,
        [fnName2]: fakeLintingFunction2,
      });
      spectral.setRules({
        example: {
          message: '',
          given: '$.responses',
          then: [
            {
              function: fnName,
              functionOptions: {
                func1Prop: '1',
              },
            },
            {
              field: '200',
              function: fnName2,
              functionOptions: {
                func2Prop: '2',
              },
            },
          ],
        },
      });
    });

    describe('given list of then objects', () => {
      test('should call each one with the appropriate args', async () => {
        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual(target.responses);
        expect(fakeLintingFunction.mock.calls[0][1]).toEqual({
          func1Prop: '1',
        });

        expect(fakeLintingFunction2).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction2.mock.calls[0][0]).toEqual(target.responses['200']);
        expect(fakeLintingFunction2.mock.calls[0][1]).toEqual({
          func2Prop: '2',
        });
      });
    });

    describe('given many then field matches', () => {
      test('should call each one with the appropriate args', async () => {
        spectral.setRules({
          example: {
            message: '',
            given: '$.responses',
            then: {
              field: '$..description',
              function: fnName,
            },
          },
        });

        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(3);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual('a');
        expect(fakeLintingFunction.mock.calls[1][0]).toEqual('b');
        expect(fakeLintingFunction.mock.calls[2][0]).toEqual('c');
      });
    });
  });

  describe('evaluate {{value}} in validation messages', () => {
    test('should print primitive values', () => {
      spectral = new Spectral();
      spectral.setRules({
        'header-parameter-names-kebab-case': {
          severity: DiagnosticSeverity.Error,
          recommended: true,
          description: 'A parameter in the header should be written in kebab-case',
          message: '{{value|to-string}} is not kebab-cased: {{error}}',
          given: "$..parameters[?(@.in === 'header')]",
          then: {
            field: 'name',
            function: 'pattern',
            functionOptions: {
              match: '^[a-z0-9]+((-[a-z0-9]+)+)?$',
            },
          },
        },
      });

      return expect(
        spectral.run({
          parameters: [
            {
              in: 'header',
              name: 'fooA',
            },
          ],
          foo: {
            parameters: [
              {
                in: 'header',
                name: 'd 1',
              },
            ],
          },
        }),
      ).resolves.toEqual([
        expect.objectContaining({
          code: 'header-parameter-names-kebab-case',
          message: '"fooA" is not kebab-cased: must match the pattern \'^[a-z0-9]+((-[a-z0-9]+)+)?$\'',
          path: ['parameters', '0', 'name'],
        }),

        expect.objectContaining({
          code: 'header-parameter-names-kebab-case',
          message: '"d 1" is not kebab-cased: must match the pattern \'^[a-z0-9]+((-[a-z0-9]+)+)?$\'',
          path: ['foo', 'parameters', '0', 'name'],
        }),
      ]);
    });

    test('should not attempt to print complex values', () => {
      spectral = new Spectral();
      spectral.setRules({
        'empty-is-falsy': {
          severity: DiagnosticSeverity.Error,
          recommended: true,
          description: 'Should be falsy',
          message: 'Value {{value|to-string}} should be falsy',
          given: '$..empty',
          then: {
            function: 'falsy',
          },
        },
      });

      return expect(
        spectral.run({
          empty: {
            a: 'b',
          },
          bar: {
            empty: [13, { empty: 123 }],
          },
        }),
      ).resolves.toEqual([
        expect.objectContaining({
          code: 'empty-is-falsy',
          message: 'Value Object{} should be falsy',
          path: ['empty'],
        }),
        expect.objectContaining({
          code: 'empty-is-falsy',
          message: 'Value Array[] should be falsy',
          path: ['bar', 'empty'],
        }),
        expect.objectContaining({
          code: 'empty-is-falsy',
          message: 'Value 123 should be falsy',
          path: ['bar', 'empty', '1', 'empty'], // fixme: 1 should be a number
        }),
      ]);
    });
  });

  test('should evaluate {{path}} in validation messages', async () => {
    spectral.registerFormat('oas2', isOpenApiv2);
    spectral.registerFormat('oas3', isOpenApiv3);
    await spectral.loadRuleset('spectral:oas');
    spectral.setRules({
      'oas3-schema': {
        ...spectral.rules['oas3-schema'],
        message: 'Schema error at {{path}}',
      },
    });

    return expect(spectral.run(invalidSchema)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'oas3-schema',
          message: 'Schema error at #/paths/~1pets/get/responses/200',
          path: ['paths', '/pets', 'get', 'responses', '200'],
        }),
      ]),
    );
  });

  test('should report ref siblings', async () => {
    spectral.registerFormat('oas2', isOpenApiv2);
    spectral.registerFormat('oas3', isOpenApiv3);
    await spectral.loadRuleset('spectral:oas');

    const results = await spectral.run({
      $ref: '#/',
      responses: {
        200: {
          description: 'a',
        },
        201: {
          description: 'b',
        },
        300: {
          description: 'c',
          abc: 'd',
          $ref: '#/d',
        },
      },
      openapi: '3.0.0',
    });

    expect(results).toEqual(
      expect.arrayContaining([
        {
          code: 'no-$ref-siblings',
          message: '$ref cannot be placed next to any other properties',
          path: ['responses'],
          range: {
            end: {
              character: 19,
              line: 12,
            },
            start: {
              character: 14,
              line: 2,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: 'no-$ref-siblings',
          message: '$ref cannot be placed next to any other properties',
          path: ['responses', '300', 'description'],
          range: {
            end: {
              character: 24,
              line: 10,
            },
            start: {
              character: 21,
              line: 10,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: 'no-$ref-siblings',
          message: '$ref cannot be placed next to any other properties',
          path: ['responses', '300', 'abc'],
          range: {
            end: {
              character: 16,
              line: 11,
            },
            start: {
              character: 13,
              line: 11,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
      ]),
    );
  });

  describe('runWithResolved', () => {
    test('should include both resolved and validation results', async () => {
      spectral.setRules({
        'no-info': {
          // some dumb rule to have some error
          message: 'should be OK',
          given: '$.info',
          then: {
            function: 'falsy',
          },
        },
      });

      const { result } = await new Resolver().resolve(parse(petstoreMergeKeys));
      const { resolved, results } = await spectral.runWithResolved(petstoreMergeKeys);

      expect(resolved).toEqual(result);
      expect(results).toEqual([expect.objectContaining({ code: 'no-info' })]);
    });
  });

  describe('legacy parsed document', () => {
    beforeEach(() => {
      spectral.setRules({
        'falsy-document': {
          // some dumb rule to have some error
          given: '$',
          then: {
            function: 'falsy',
          },
        },
      });
    });

    test('should set parsed.source as the source of document', async () => {
      const parsedResult: IParsedResult = {
        parsed: {
          data: {},
          diagnostics: [],
          ast: {},
          lineMap: [],
        },
        getLocationForJsonPath: jest.fn(),
        source: 'foo',
      };

      const results = await spectral.run(parsedResult, {
        ignoreUnknownFormat: true,
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'falsy-document',
          source: 'foo',
        }),
      ]);
    });

    test('given missing source on parsedResult, should try to set resolveUri as source of the document', async () => {
      const parsedResult: IParsedResult = {
        parsed: {
          data: {},
          diagnostics: [],
          ast: {},
          lineMap: [],
        },
        getLocationForJsonPath: jest.fn(),
      };

      const results = await spectral.run(parsedResult, {
        ignoreUnknownFormat: true,
        resolve: {
          documentUri: 'foo',
        },
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'falsy-document',
          source: 'foo',
        }),
      ]);
    });
  });
});
