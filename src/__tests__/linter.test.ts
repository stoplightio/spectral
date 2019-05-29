import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import * as path from 'path';
import { oas2Functions } from '../rulesets/oas2';
import * as oas2Ruleset from '../rulesets/oas2/ruleset.json';
import { oas3Functions } from '../rulesets/oas3';
import * as oas3Ruleset from '../rulesets/oas3/ruleset.json';
import { Spectral } from '../spectral';
import { RuleCollection } from '../types';

const invalidSchema = fs.readFileSync(
  path.join(__dirname, './__fixtures__/petstore.invalid-schema.oas3.yaml'),
  'utf-8',
);

const schemaOAS3 = fs.readFileSync(path.join(__dirname, './__fixtures__/myschema_oas3.yml'), 'utf-8');
const schemaOAS2 = fs.readFileSync(path.join(__dirname, './__fixtures__/myschema_oas2_1.yaml'), 'utf-8');
const schemaOAS2_2 = fs.readFileSync(path.join(__dirname, './__fixtures__/myschema_oas2_2.yaml'), 'utf-8');

const todosInvalid = fs.readFileSync(path.join(__dirname, './__fixtures__/todos.invalid.oas2.json'), 'utf-8');

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
    summary: '',
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
          code: 'YAMLException',
          message: 'unknown tag <tag:yaml.org,2002:foo>',
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
          code: 'YAMLException',
          message: 'bad indentation of a mapping entry',
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

  test('should merge similar ajv errors', async () => {
    spectral.addRules(oas3Ruleset.rules as RuleCollection);
    spectral.addFunctions(oas3Functions());

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'oas3-schema',
          message: 'should NOT have additional properties: type',
          summary: 'should NOT have additional properties: type',
          path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
        }),
        expect.objectContaining({
          code: 'oas3-schema',
          message: 'should match exactly one schema in oneOf',
          summary: 'should match exactly one schema in oneOf',
          path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
        }),
        expect.objectContaining({
          code: 'oas3-schema',
          message: "should have required property '$ref'",
          summary: "should have required property '$ref'",
          path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
        }),
      ]),
    );
  });

  describe('example and type', () => {
    test('OAS3', async () => {
      spectral.addRules(oas3Ruleset.rules as RuleCollection);
      spectral.addFunctions(oas3Functions());

      const results = await spectral.run(schemaOAS3);

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'valid-openapi-example',
            message: '32323 is not of type string',
            summary: '32323 is not of type string',
            path: ['paths', '/pets/{petId}', 'get', 'parameters', 0],
          }),
        ]),
      );
    });

    test('OAS2 - 1', async () => {
      spectral.addRules(oas2Ruleset.rules as RuleCollection);
      spectral.addFunctions(oas2Functions());

      const results = await spectral.run(schemaOAS2);

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'valid-openapi-example',
            message: '23 is not of type integer',
            summary: '23 is not of type integer',
            path: ['paths', '/pets/{petId}', 'post', 'parameters', 0],
          }),
        ]),
      );
    });

    test('OAS2 - 2', async () => {
      spectral.addRules(oas2Ruleset.rules as RuleCollection);
      spectral.addFunctions(oas2Functions());

      const results = await spectral.run(schemaOAS2_2);

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'valid-openapi-example',
            message: '222 is not of type string',
            summary: '222 is not of type string',
            path: ['paths', '/pets/{petId}', 'get', 'parameters', 0],
          }),
        ]),
      );
    });
  });

  test('should report invalid schema $refs', async () => {
    spectral.addRules(oas3Ruleset.rules as RuleCollection);
    spectral.addFunctions(oas3Functions());

    const result = await spectral.run(todosInvalid);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'valid-schema-example',
          message: '"schema" property can\'t resolve reference #/parameters/missing from id #',
          path: ['paths', '/todos/{todoId}', 'put', 'parameters', 1, 'schema'],
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
          message: "No reader defined for scheme 'file' in ref file://models/pet.yaml",
          path: ['paths', '/pets', 'get', 'responses', '200', 'content', 'application/json', 'schema', '$ref'],
          severity: DiagnosticSeverity.Error,
        }),
        expect.objectContaining({
          code: 'invalid-ref',
          message: "No reader defined for scheme 'file' in ref file://../common/models/error.yaml",
          path: ['paths', '/pets', 'get', 'responses', 'default', 'content', 'application/json', 'schema', '$ref'],
          severity: DiagnosticSeverity.Error,
        }),
      ]),
    );
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
            summary: '',
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
          summary: '',
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
            summary: '',
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
