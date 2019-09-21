import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import { Resolver } from '@stoplight/json-ref-resolver';
import { DiagnosticSeverity } from '@stoplight/types';
import { parse } from '@stoplight/yaml';
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
    spectral.registerFormat('oas3', isOpenApiv3);
    spectral.registerFormat('oas2', isOpenApiv2);
  });

  test('should not lint if passed in value is not an object', async () => {
    const fakeLintingFunction = jest.fn();
    spectral.setFunctions({
      [fnName]: fakeLintingFunction,
    });
    spectral.setRules(rules);

    const result = await spectral.run('123');

    expect(result).toHaveLength(0);
  });

  test('should return all properties', async () => {
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
        given: '$.responses[*]',
        when: {
          field: '@key',
          pattern: '^4.*',
        },
        then: {
          field: 'description',
          function: 'func1',
        },
      },
    });

    const result = await spectral.run({
      responses: {
        '200': {
          name: 'ok',
        },
        '404': {
          name: 'not found',
        },
      },
    });

    expect(result[0]).toMatchObject({
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
    });
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

    const result = await spectral.run({
      x: true,
    });

    expect(result[0]).toHaveProperty('severity', DiagnosticSeverity.Hint);
  });

  test('should not report anything for disabled rules', async () => {
    await spectral.loadRuleset('spectral:oas3');
    const { rules: oas3Rules } = await readRuleset('spectral:oas3');
    spectral.setRules(mergeRules(oas3Rules, {
      'valid-example-in-schemas': 'off',
      'model-description': -1,
    }) as RuleCollection);

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual([
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: "/paths//pets/get/responses/200 should have required property '$ref'",
        path: ['paths', '/pets', 'get', 'responses', '200'],
      }),
    ]);
  });

  test('should output unescaped json paths', async () => {
    await spectral.loadRuleset('spectral:oas3');

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'oas3-schema',
          message: "/paths//pets/get/responses/200 should have required property '$ref'",
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

    const result = await spectral.run({
      x: false,
      y: '',
    });

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
      expect.objectContaining({
        code: 'rule3',
      }),
    ]);
  });

  test('should include parser diagnostics', async () => {
    await spectral.loadRuleset('spectral:oas2');

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
    await spectral.loadRuleset('spectral:oas3');

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
    await spectral.loadRuleset('spectral:oas3');

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual([
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'valid-example-in-schemas',
        message: '"foo.example" property type should be number',
        path: ['components', 'schemas', 'foo', 'example'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: "/paths//pets/get/responses/200 should have required property '$ref'",
        path: ['paths', '/pets', 'get', 'responses', '200'],
      }),
    ]);
  });

  test('should report invalid schema $refs', async () => {
    await spectral.loadRuleset('spectral:oas2');

    const result = await spectral.run(todosInvalid);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'valid-example-in-parameters',
          message: '"schema.example" property can\'t resolve reference #/parameters/missing from id #',
          path: ['paths', '/todos/{todoId}', 'put', 'parameters', '1', 'schema', 'example'],
        }),
      ]),
    );
  });

  test('should report invalid $refs', async () => {
    await spectral.loadRuleset('spectral:oas3');

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
    await spectral.loadRuleset('spectral:oas3');

    const result = await spectral.run(petstoreMergeKeys);

    expect(result).toEqual([]);
  });

  describe('reports duplicated properties for', () => {
    test('JSON format', async () => {
      const result = await spectral.run({
        parsed: parseWithPointers('{"foo":true,"foo":false}', { ignoreDuplicateKeys: false }),
        getLocationForJsonPath,
      });

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
      const result = await spectral.run(`foo: bar\nfoo: baz`);

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

  describe('functional tests for the when statement', () => {
    let fakeLintingFunction: any;

    beforeEach(() => {
      fakeLintingFunction = jest.fn();
      spectral.setFunctions({
        [fnName]: fakeLintingFunction,
      });
      spectral.setRules(rules);
    });

    describe('given no when', () => {
      test('should simply lint anything it matches in the given', async () => {
        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual(target.responses);
      });
    });

    describe('given when with no pattern and regular field', () => {
      test('should call linter if when field exists', async () => {
        spectral.mergeRules({
          example: {
            when: {
              field: '200.description',
            },
          },
        });
        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual({
          '200': { description: 'a' },
          '201': { description: 'b' },
          '300': { description: 'c' },
        });
      });

      test('should not call linter if when field not exist', async () => {
        spectral.mergeRules({
          example: {
            when: {
              field: '302.description',
            },
          },
        });
        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(0);
      });
    });

    describe('given "when" with a pattern and regular field', () => {
      test('should NOT lint if pattern does not match', async () => {
        spectral.mergeRules({
          example: {
            when: {
              field: '200.description',
              pattern: 'X',
            },
          },
        });
        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(0);
      });

      test('should lint if pattern does match', async () => {
        spectral.mergeRules({
          example: {
            when: {
              field: '200.description',
              pattern: 'a',
            },
          },
        });
        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual({
          '200': { description: 'a' },
          '201': { description: 'b' },
          '300': { description: 'c' },
        });
      });
    });

    describe('given "when" with a pattern and @key field', () => {
      test('should lint ONLY part of object that matches pattern', async () => {
        spectral.mergeRules({
          example: {
            given: '$.responses[*]',
            when: {
              field: '@key',
              pattern: '2..',
            },
          },
        });
        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(2);
        expect(fakeLintingFunction.mock.calls[0][0]).toEqual({
          description: 'a',
        });
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

  test('should report ref siblings', async () => {
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
});
