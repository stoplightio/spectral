import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import { DiagnosticSeverity } from '@stoplight/types';
import { cloneDeep } from 'lodash';
import { mergeRulesets } from '../rulesets/merger';
import { oas2Functions } from '../rulesets/oas2';
import * as oas2Ruleset from '../rulesets/oas2/index.json';
import { oas3Functions } from '../rulesets/oas3';
import * as oas3Ruleset from '../rulesets/oas3/index.json';
import { Spectral } from '../spectral';
import { RuleCollection } from '../types';
import { IRulesetFile } from '../types/ruleset';

const invalidSchema = JSON.stringify(require('./__fixtures__/petstore.invalid-schema.oas3.json'));
const todosInvalid = JSON.stringify(require('./__fixtures__/todos.invalid.oas2.json'));

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
  });

  test('should not lint if passed in value is not an object', async () => {
    const fakeLintingFunction = jest.fn();
    spectral.addFunctions({
      [fnName]: fakeLintingFunction,
    });
    spectral.addRules(rules);

    const result = await spectral.run('123');

    expect(result).toHaveLength(0);
  });

  test('should return all properties', async () => {
    const message = '4xx responses require a description';

    spectral.addFunctions({
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

    spectral.addRules({
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
      path: ['responses', '404', 'description'],
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
    spectral.addFunctions({
      func1: () => {
        return [
          {
            message: 'foo',
          },
        ];
      },
    });

    spectral.addRules({
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
    spectral.addFunctions(oas3Functions());
    spectral.addRules(mergeRulesets(cloneDeep(oas3Ruleset) as IRulesetFile, {
      rules: {
        'valid-example': 'off',
        'model-description': -1,
      },
    }).rules as RuleCollection);

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
        path: ['paths', '~1pets', 'get', 'responses', '200'],
      }),
    ]);
  });

  test('should support human readable severity levels', async () => {
    spectral.addFunctions(oas2Functions());

    spectral.addRules({
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

  test('should include parser diagnostics', async () => {
    spectral.addRules(oas2Ruleset.rules as RuleCollection);
    spectral.addFunctions(oas2Functions());

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

  test('should remove all redundant ajv errors', async () => {
    spectral.addRules(oas3Ruleset.rules as RuleCollection);
    spectral.addFunctions(oas3Functions());

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual([
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'model-description',
      }),
      expect.objectContaining({
        code: 'valid-example',
        message: '"foo" property type should be number',
        path: ['components', 'schemas', 'foo'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: "/paths//pets/get/responses/200 should have required property '$ref'",
        path: ['paths', '~1pets', 'get', 'responses', '200'],
      }),
    ]);
  });

  test('should report invalid schema $refs', async () => {
    spectral.addRules(oas3Ruleset.rules as RuleCollection);
    spectral.addFunctions(oas3Functions());

    const result = await spectral.run(todosInvalid);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'valid-example',
          message: '"schema" property can\'t resolve reference #/parameters/missing from id #',
          path: ['paths', '/todos/{todoId}', 'put', 'parameters', '1', 'schema'],
        }),
      ]),
    );
  });

  test('should report invalid $refs', async () => {
    spectral.addRules(oas3Ruleset.rules as RuleCollection);
    spectral.addFunctions(oas3Functions());

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
      spectral.addFunctions({
        [fnName]: fakeLintingFunction,
      });
      spectral.addRules(rules);
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
        spectral.addRules({
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
      spectral.addFunctions({
        [fnName]: fakeLintingFunction,
      });
      spectral.addRules(rules);
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
      spectral.addFunctions({
        [fnName]: fakeLintingFunction,
        [fnName2]: fakeLintingFunction2,
      });
      spectral.addRules({
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
        spectral.addRules({
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
});
