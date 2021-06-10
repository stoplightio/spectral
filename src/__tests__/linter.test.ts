import { Resolver } from '@stoplight/json-ref-resolver';
import { DiagnosticSeverity, JsonPath } from '@stoplight/types';
import { parse } from '@stoplight/yaml';
import { IParsedResult } from '../document';
import { Spectral } from '../spectral';
import { Parsers, Document } from '..';
import { IParser } from '../parsers/types';
import { createWithRules } from '../rulesets/oas/__tests__/__helpers__/tester';

const invalidSchema = JSON.stringify(require('./__fixtures__/petstore.invalid-schema.oas3.json'));

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

  test('should not throw if passed in value is not an object', () => {
    const fakeLintingFunction = jest.fn();
    spectral.setFunctions({
      [fnName]: fakeLintingFunction,
    });
    spectral.setRules(rules);

    return expect(spectral.run('123')).resolves.toBeTruthy();
  });

  test('given failing JSON Path expression, should refuse to lint', async () => {
    spectral.setRules({
      rule1: {
        given: '$.bar[?(@.in==foo)]',
        then: {
          function: 'truthy',
        },
      },
      rule2: {
        given: '$.foo',
        then: {
          function: 'truthy',
        },
      },
    });

    await expect(
      spectral.run({
        bar: {
          in: {},
        },
        foo: null,
      }),
    ).rejects.toThrow();
  });

  test('should return all properties matching 4xx response code', async () => {
    const message = '4xx responses require a description';

    spectral.setFunctions({
      func1: (val: unknown) => {
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
        given: '$.responses[?(@property >= 400 && @property < 500)]',
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

  test('should output unescaped json paths', async () => {
    spectral.setRuleset({
      rules: {
        'valid-header': {
          given: '$..header',
          message: 'Header should be valid',
          then: {
            field: 'a~',
            function: 'falsy',
          },
        },
      },
      functions: {},
      exceptions: {},
    });

    const result = await spectral.run(
      {
        a: {
          '/b': {
            header: {
              'a~': 1,
            },
          },
        },
      },
      { ignoreUnknownFormat: true },
    );

    expect(result).toEqual([
      expect.objectContaining({
        code: 'valid-header',
        path: ['a', '/b', 'header', 'a~'],
      }),
    ]);
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
    spectral.registerFormat('oas2', () => false);
    spectral.registerFormat('oas3', () => false);

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
    spectral.registerFormat('oas2', () => false);
    spectral.registerFormat('oas3', () => false);
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

  // TODO: Find a way to cover formats more extensively
  test('given a string input, should warn about unmatched formats', async () => {
    spectral.registerFormat('oas2', () => false);
    spectral.registerFormat('oas3', () => false);
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

  test('should accept format lookup by source', async () => {
    spectral.registerFormat('foo-bar', (_, source) => source === '/foo/bar');

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

    const result = await spectral.run(new Document(`x: false\ny: ''`, Parsers.Yaml, '/foo/bar'));

    expect(result).toEqual([
      expect.objectContaining({
        code: 'rule1',
      }),
    ]);
  });

  test('should include parser diagnostics', async () => {
    const responses = `
responses:: !!foo
  400:
    description: a
  204:
    description: b
 200:
     description: c
`;

    const result = await spectral.run(responses, { ignoreUnknownFormat: true });

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
    spectral.setRules({
      'truthy-get': {
        given: '$..get',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run(
      JSON.stringify(
        {
          paths: {
            '/test': {
              get: null,
            },
          },
        },
        null,
        2,
      ),
      {
        ignoreUnknownFormat: true,
      },
    );

    expect(result).toEqual([
      expect.objectContaining({
        code: 'truthy-get',
        path: ['paths', '/test', 'get'],
        range: {
          end: {
            character: 17,
            line: 3,
          },
          start: {
            character: 13,
            line: 3,
          },
        },
      }),
    ]);
  });

  test('should remove all redundant ajv errors', async () => {
    const spectral = await createWithRules(['oas3-schema', 'oas3-valid-schema-example', 'oas3-valid-media-example']);

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual([
      expect.objectContaining({
        code: 'oas3-schema',
        message: '`email` property must match format `email`.',
        path: ['info', 'contact', 'email'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: '`header-1` property must have required property `schema`.',
        path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: 'Property `type` is not expected to be here.',
        path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1', 'type'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: 'Property `op` is not expected to be here.',
        path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1', 'op'],
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'oas3-valid-schema-example',
        message: '`example` property type must be number',
        path: ['components', 'schemas', 'foo', 'example'],
      }),
    ]);
  });

  test('should report invalid schema $refs', async () => {
    const result = await spectral.run(
      JSON.stringify(
        {
          paths: {
            '/todos/{todoId}': {
              put: {
                parameters: [
                  {
                    name: 'missing',
                    in: 'body',
                    schema: {
                      $ref: '#/parameters/missing',
                      example: 'test',
                    },
                  },
                ],
              },
            },
          },
        },
        null,
        2,
      ),
    );

    expect(result).toEqual([
      expect.objectContaining({
        code: 'invalid-ref',
        message: "'#/parameters/missing' does not exist",
        path: ['paths', '/todos/{todoId}', 'put', 'parameters', '0', 'schema', '$ref'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('should report when a resolver is not defined for a given $ref type', async () => {
    const s = new Spectral({ resolver: new Resolver() });
    const document = JSON.stringify({
      'file-refs': [{ $ref: './models/pet.yaml' }, { $ref: '../common/models/error.yaml' }],
    });

    const result = await s.run(document);

    expect(result).toEqual([
      expect.objectContaining({
        code: 'invalid-ref',
        message: "No resolver defined for scheme 'file' in ref ./models/pet.yaml",
        path: ['file-refs', '0', '$ref'],
        severity: DiagnosticSeverity.Error,
      }),
      expect.objectContaining({
        code: 'invalid-ref',
        message: "No resolver defined for scheme 'file' in ref ../common/models/error.yaml",
        path: ['file-refs', '1', '$ref'],
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  describe('reports duplicated properties for', () => {
    it('JSON format', async () => {
      const result = await spectral.run('{"foo":true,"foo":false}', {
        ignoreUnknownFormat: true,
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
      const result = await spectral.run(`foo: bar\nfoo: baz`, {
        ignoreUnknownFormat: true,
      });

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
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });

  describe('parser options', () => {
    test('should allow changing the severity of invalid YAML mapping keys diagnostics', async () => {
      spectral.setRuleset({
        rules: {},
        functions: {},
        exceptions: {},
        parserOptions: {
          incompatibleValues: 'info',
        },
      });
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
          severity: DiagnosticSeverity.Information,
        },
      ]);
    });

    test('should allow disabling invalid YAML mapping keys diagnostics', async () => {
      spectral.setRuleset({
        rules: {},
        functions: {},
        exceptions: {},
        parserOptions: {
          incompatibleValues: 'off',
        },
      });
      const results = await spectral.run(
        `responses:
  200:
    description: ''
  500:
  '400':
    description: ''`,
        { ignoreUnknownFormat: true },
      );

      expect(results).toEqual([]);
    });

    test.each<keyof typeof Parsers>(['Json', 'Yaml'])(
      'should allow changing the severity of duplicate key diagnostics reported by %s parser',
      async parser => {
        spectral.setRuleset({
          rules: {},
          functions: {},
          exceptions: {},
          parserOptions: {
            duplicateKeys: 'info',
          },
        });

        const results = await spectral.run(
          new Document(
            `{
  "200": {},
  "200": {}
}`,
            Parsers[parser] as IParser,
          ),
          { ignoreUnknownFormat: true },
        );

        expect(results).toEqual([
          {
            code: 'parser',
            message: 'Duplicate key: 200',
            path: ['200'],
            range: {
              end: {
                character: 7,
                line: 2,
              },
              start: {
                character: 2,
                line: 2,
              },
            },
            severity: DiagnosticSeverity.Information,
          },
        ]);
      },
    );

    test.each<keyof typeof Parsers>(['Json', 'Yaml'])(
      'should allow disabling duplicate key diagnostics reported by %s parser',
      async parser => {
        spectral.setRuleset({
          rules: {},
          functions: {},
          exceptions: {},
          parserOptions: {
            duplicateKeys: 'off',
          },
        });

        const results = await spectral.run(
          new Document(
            `{
  "200": {},
  "200": {},
  "200": {}
}`,
            Parsers[parser] as IParser,
          ),
          { ignoreUnknownFormat: true },
        );

        expect(results).toEqual([]);
      },
    );
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
        let path: JsonPath | null = null;
        let given: unknown;
        (fakeLintingFunction as jest.Mock).mockImplementation((_targetVal, _opts, paths, values) => {
          path = [...paths.given];
          given = values.given;
        });

        await spectral.run(target);

        expect(fakeLintingFunction).toHaveBeenCalledTimes(1);
        expect(path).toEqual(['responses']);
        expect(given).toEqual(target.responses);
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
          message: '#{{print("value")}} is not kebab-cased: {{error}}',
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
          message: '"fooA" is not kebab-cased: "fooA" must match the pattern "^[a-z0-9]+((-[a-z0-9]+)+)?$"',
          path: ['parameters', '0', 'name'],
        }),

        expect.objectContaining({
          code: 'header-parameter-names-kebab-case',
          message: '"d 1" is not kebab-cased: "d 1" must match the pattern "^[a-z0-9]+((-[a-z0-9]+)+)?$"',
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
          message: 'Value #{{print("value")}} should be falsy',
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

    test('should print correct values for referenced files', async () => {
      const resolver = new Resolver({
        resolvers: {
          file: {
            async resolve() {
              return JSON.stringify({
                info: {
                  contact: {
                    url: 'stoplight.io',
                  },
                },
                servers: [],
              });
            },
          },
        },
      });

      spectral = new Spectral({ resolver });

      spectral.setRules({
        'empty-is-falsy': {
          severity: DiagnosticSeverity.Error,
          recommended: true,
          description: 'Should be falsy',
          message: 'Value #{{print("value")}} should be falsy',
          given: '$..empty',
          then: {
            function: 'falsy',
          },
        },
      });

      const results = await spectral.run(
        new Document(
          JSON.stringify({
            foo: {
              empty: {
                $ref: './spec.json#/info',
              },
            },
            empty: {
              $ref: './spec.json#/info/contact/url',
            },
            bar: {
              empty: {
                $ref: './spec.json#/servers',
              },
            },
          }),
          Parsers.Json,
          'test.json',
        ),
      );

      expect(results).toEqual([
        expect.objectContaining({
          code: 'empty-is-falsy',
          message: 'Value Object{} should be falsy',
          path: ['info'],
        }),
        expect.objectContaining({
          code: 'empty-is-falsy',
          message: 'Value "stoplight.io" should be falsy',
          path: ['info', 'contact', 'url'],
        }),
        expect.objectContaining({
          code: 'empty-is-falsy',
          message: 'Value Array[] should be falsy',
          path: ['servers'],
        }),
      ]);
    });
  });

  test('should evaluate {{path}} in validation messages', async () => {
    spectral.setRules({
      'truthy-get': {
        given: '$..get',
        message: 'Invalid value at {{path}}',
        then: {
          function: 'truthy',
        },
      },
    });

    const result = await spectral.run(
      {
        paths: {
          '/test': {
            get: null,
          },
        },
      },
      {
        ignoreUnknownFormat: true,
      },
    );

    return expect(result).toEqual([
      expect.objectContaining({
        code: 'truthy-get',
        message: 'Invalid value at #/paths/~1test/get',
        path: ['paths', '/test', 'get'],
      }),
    ]);
  });

  describe('runWithResolved', () => {
    test('should include both resolved and validation results', async () => {
      const document = JSON.stringify({
        info: null,
      });

      spectral.setRules({
        'no-info': {
          // some dumb rule to have some error
          message: 'should be OK',
          given: '$.info',
          then: {
            function: 'truthy',
          },
        },
      });

      const { result } = await new Resolver().resolve(parse(document));
      const { resolved, results } = await spectral.runWithResolved(document);

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

  test.each(['1', 'null', '', 'false'])('given %s input, should report nothing', async input => {
    const s = new Spectral();

    const source = '/tmp/file.yaml';
    const doc = new Document(input, Parsers.Yaml, source);

    const results = await s.run(doc);

    expect(results).toEqual([]);
  });

  test('should be capable of linting arrays', async () => {
    const s = new Spectral();

    s.setRules({
      'falsy-foo': {
        given: '$..foo',
        then: {
          function: 'falsy',
        },
      },
      'truthy-bar': {
        given: '$..bar',
        then: {
          function: 'truthy',
        },
      },
    });

    const source = '/tmp/file.yaml';
    const doc = new Document(
      JSON.stringify([
        {
          foo: true,
        },
        {
          bar: true,
        },
      ]),
      Parsers.Yaml,
      source,
    );

    const results = await s.run(doc);

    expect(results).toEqual([
      {
        code: 'falsy-foo',
        message: '`foo` property must be falsy',
        path: ['0', 'foo'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
        source,
      },
    ]);
  });
});
