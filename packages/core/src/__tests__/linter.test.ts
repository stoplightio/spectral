import { falsy, pattern, truthy } from '@stoplight/spectral-functions';
import { DiagnosticSeverity } from '@stoplight/types';
import { parse } from '@stoplight/yaml';
import * as Parsers from '@stoplight/spectral-parsers';
import { Resolver } from '@stoplight/spectral-ref-resolver';

import { IParsedResult } from '../document';
import { Document, Spectral, Format, RulesetDefinition, Ruleset } from '..';
import { normalize } from '@stoplight/path';
import * as path from '@stoplight/path';

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

describe('linter', () => {
  let spectral: Spectral;

  beforeEach(() => {
    spectral = new Spectral();
  });

  test('should demand some result', () => {
    return expect(spectral.run(new Document('123', Parsers.Json))).rejects.toThrow(
      'No ruleset has been defined. Have you called setRuleset()?',
    );
  });

  test('should not throw if passed in value is not an object', () => {
    spectral.setRuleset({
      rules: {
        example: {
          message: '',
          given: '$.responses',
          then: {
            function: jest.fn(),
          },
        },
      },
    });

    return expect(spectral.run('123')).resolves.toEqual([]);
  });

  test('given @ in the property key, should still lint as normal', () => {
    spectral.setRuleset({
      rules: {
        example: {
          given: '$.properties[*]~',
          message: 'Key must contains letters only',
          then: {
            function: pattern,
            functionOptions: {
              match: '^[a-z]+$',
            },
          },
        },
      },
    });

    return expect(
      spectral.run({
        properties: {
          '@foo': true,
          foo: true,
        },
      }),
    ).resolves.toEqual([
      {
        code: 'example',
        message: 'Key must contains letters only',
        path: ['properties', '@foo'],
        range: expect.any(Object),
        severity: 1,
      },
    ]);
  });

  test('given failing JSON Path expression, should refuse to lint', async () => {
    spectral.setRuleset({
      rules: {
        rule1: {
          given: '$.bar[?(@.in==foo)]',
          then: {
            function: truthy,
          },
        },
        rule2: {
          given: '$.foo',
          then: {
            function: truthy,
          },
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

    function func1(val: unknown) {
      if (!val) {
        return [
          {
            message,
          },
        ];
      }

      return;
    }

    spectral.setRuleset({
      rules: {
        rule1: {
          given: '$.responses[?(@property >= 400 && @property < 500)]',
          then: {
            field: 'description',
            function: func1,
          },
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
    spectral.setRuleset({
      rules: {
        rule1: {
          given: '$.x',
          severity: DiagnosticSeverity.Hint,
          then: {
            function: () => [
              {
                message: 'foo',
              },
            ],
          },
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
            function: falsy,
          },
        },
      },
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

  test('should handle semicolons in property keys', async () => {
    const document = new Document(
      `paths:
  content:
    application/json;charset=utf-8: # semicolon causes the problem
      schema:
        type: string # expecting error on this line`,
      Parsers.Yaml,
    );

    const spectral = new Spectral();

    spectral.setRuleset({
      rules: {
        rule: {
          given: '$..type',
          then: {
            function: pattern,
            functionOptions: {
              match: 'array',
            },
          },
        },
      },
    });

    expect(await spectral.run(document)).toEqual([
      {
        code: 'rule',
        message: '"string" must match the pattern "array"',
        path: ['paths', 'content', 'application/json;charset=utf-8', 'schema', 'type'],
        range: {
          end: {
            character: 20,
            line: 4,
          },
          start: {
            character: 14,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('should support human readable severity levels', async () => {
    spectral.setRuleset({
      rules: {
        rule1: {
          given: '$.x',
          severity: 'error',
          then: {
            function: truthy,
          },
        },
        rule2: {
          given: '$.y',
          severity: 'warn',
          then: {
            function: truthy,
          },
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
    const fooBarFormat: Format = obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj;

    spectral.setRuleset({
      formats: [fooBarFormat],
      rules: {
        rule1: {
          given: '$.x',
          formats: [fooBarFormat],
          severity: 'error',
          then: {
            function: truthy,
          },
        },
        rule2: {
          given: '$.y',
          formats: [],
          severity: 'warn',
          then: {
            function: truthy,
          },
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
    const fooBarFormat: Format = obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj;

    spectral.setRuleset({
      rules: {
        rule1: {
          given: '$.x',
          formats: [fooBarFormat],
          severity: 'error',
          then: {
            function: truthy,
          },
        },
        rule2: {
          given: '$.y',
          severity: 'warn',
          then: {
            function: truthy,
          },
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

  test('should execute rules matching all found formats', async () => {
    const fooBarFormat: Format = obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj;
    const bazFormat: Format = () => true;

    spectral.setRuleset({
      rules: {
        rule1: {
          given: '$.x',
          formats: [fooBarFormat],
          severity: 'error',
          then: {
            function: truthy,
          },
        },
        rule2: {
          formats: [bazFormat],
          given: '$.y',
          severity: 'warn',
          then: {
            function: truthy,
          },
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

  // TODO: Find a way to cover formats more extensively
  test('given a string input, should warn about unmatched formats', async () => {
    const oas2: Format = () => false;
    const oas3: Format = () => false;
    spectral.setRuleset({
      formats: [oas2, oas3],
      rules: {
        test: {
          given: '$',
          then: {
            function: truthy,
          },
        },
      },
    });
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
    const format: Format = obj => typeof obj === 'object' && obj !== null && 'foo-bar' in obj;

    spectral.setRuleset({
      formats: [format],
      rules: {
        rule1: {
          given: '$.x',
          formats: [format],
          severity: 'error',
          then: {
            function: truthy,
          },
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
    const fooBar: Format = (_, source) => source === '/foo/bar';

    spectral.setRuleset({
      rules: {
        rule1: {
          given: '$.x',
          formats: [fooBar],
          severity: 'error',
          then: {
            function: truthy,
          },
        },
        rule2: {
          given: '$.y',
          formats: [],
          severity: 'warn',
          then: {
            function: truthy,
          },
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

    spectral.setRuleset({ rules: {} });
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
    spectral.setRuleset({
      rules: {
        'truthy-get': {
          given: '$..get',
          then: {
            function: truthy,
          },
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

  test('should report invalid schema $refs', async () => {
    spectral.setRuleset({ rules: {} });
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

  test('should report when a resolver is no t defined for a given $ref type', async () => {
    const s = new Spectral({ resolver: new Resolver() });
    s.setRuleset(new Ruleset({ rules: {} }));

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
    test('JSON format', async () => {
      spectral.setRuleset({ rules: {} });
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
      spectral.setRuleset({ rules: {} });
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
    spectral.setRuleset({ rules: {} });
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
            Parsers[parser] as Parsers.IParser,
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
            Parsers[parser] as Parsers.IParser,
          ),
          { ignoreUnknownFormat: true },
        );

        expect(results).toEqual([]);
      },
    );
  });

  describe('functional tests for the then statement', () => {
    let fakeLintingFunction: jest.Mock;
    let fakeLintingFunction2: jest.Mock;

    beforeEach(() => {
      fakeLintingFunction = jest.fn();
      fakeLintingFunction2 = jest.fn();
      spectral.setRuleset({
        rules: {
          example: {
            message: '',
            given: '$.responses',
            then: [
              {
                function: fakeLintingFunction,
                functionOptions: {
                  func1Prop: '1',
                },
              },
              {
                field: '200',
                function: fakeLintingFunction2,
                functionOptions: {
                  func2Prop: '2',
                },
              },
            ],
          },
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
        spectral.setRuleset({
          rules: {
            example: {
              message: '',
              given: '$.responses',
              then: {
                field: '$..description',
                function: fakeLintingFunction,
              },
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
      spectral.setRuleset({
        rules: {
          'header-parameter-names-kebab-case': {
            severity: DiagnosticSeverity.Error,
            recommended: true,
            description: 'A parameter in the header should be written in kebab-case',
            message: '#{{print("value")}} is not kebab-cased: {{error}}',
            given: "$..parameters[?(@.in === 'header')]",
            then: {
              field: 'name',
              function: pattern,
              functionOptions: {
                match: '^[a-z0-9]+((-[a-z0-9]+)+)?$',
              },
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
      spectral.setRuleset({
        rules: {
          'empty-is-falsy': {
            severity: DiagnosticSeverity.Error,
            recommended: true,
            description: 'Should be falsy',
            message: 'Value #{{print("value")}} should be falsy',
            given: '$..empty',
            then: {
              function: falsy,
            },
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

      spectral.setRuleset({
        rules: {
          'empty-is-falsy': {
            severity: DiagnosticSeverity.Error,
            recommended: true,
            description: 'Should be falsy',
            message: 'Value #{{print("value")}} should be falsy',
            given: '$..empty',
            then: {
              function: falsy,
            },
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
    spectral.setRuleset({
      rules: {
        'truthy-get': {
          given: '$..get',
          message: 'Invalid value at {{path}}',
          then: {
            function: truthy,
          },
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

      spectral.setRuleset({
        rules: {
          'no-info': {
            // some dumb rule to have some error
            message: 'should be OK',
            given: '$.info',
            then: {
              function: truthy,
            },
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
      spectral.setRuleset({
        rules: {
          'falsy-document': {
            // some dumb rule to have some error
            given: '$',
            then: {
              function: falsy,
            },
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
  });

  test.each(['1', 'null', '', 'false'])('given %s input, should report nothing', async input => {
    const s = new Spectral();
    s.setRuleset(new Ruleset({ rules: {} }));

    const source = '/tmp/file.yaml';
    const doc = new Document(input, Parsers.Yaml, source);

    const results = await s.run(doc);

    expect(results).toEqual([]);
  });

  test('should be capable of linting arrays', async () => {
    const s = new Spectral();

    s.setRuleset({
      rules: {
        'falsy-foo': {
          given: '$..foo',
          then: {
            function: falsy,
          },
        },
        'truthy-bar': {
          given: '$..bar',
          then: {
            function: truthy,
          },
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
        message: '"foo" property must be falsy',
        path: ['0', 'foo'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
        source,
      },
    ]);
  });

  describe('Pointers in overrides', () => {
    test('should be supported', async () => {
      const documentUri = normalize(path.join(__dirname, './__fixtures__/test.json'));
      const ruleset: RulesetDefinition = {
        rules: {
          'valid-type': {
            given: '$..type',
            then: {
              function: falsy,
            },
          },
        },
        overrides: [
          {
            files: ['**/*.json#/foo/type'],
            rules: {
              'valid-type': 'info',
            },
          },
          {
            files: ['**/*.json', '**/*.json#/type'],
            rules: {
              'valid-type': 'error',
            },
          },
          {
            files: ['**/*.json#/bar/type'],
            rules: {
              'valid-type': 'off',
            },
          },
          {
            files: ['**/*.json#/bar/type/foo/type'],
            rules: {
              'valid-type': 'hint',
            },
          },
        ],
      };

      const spectral = new Spectral();

      spectral.setRuleset(new Ruleset(ruleset, { source: path.join(path.dirname(documentUri), 'ruleset.json') }));

      const document = new Document(
        JSON.stringify({
          foo: {
            type: 'number',
          },
          bar: {
            type: {
              foo: {
                type: 'number',
              },
            },
          },
          baz: {
            type: 'number',
          },
        }),
        Parsers.Json,
        documentUri,
      );

      const results = await spectral.run(document);
      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-type',
          path: ['foo', 'type'],
          severity: DiagnosticSeverity.Information,
        }),
        expect.objectContaining({
          code: 'valid-type',
          path: ['bar', 'type', 'foo', 'type'],
          severity: DiagnosticSeverity.Hint,
        }),
        expect.objectContaining({
          code: 'valid-type',
          path: ['baz', 'type'],
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    });

    test('should respect the order of definitions', async () => {
      const documentUri = normalize(path.join(__dirname, './__fixtures__/test.json'));
      const ruleset: RulesetDefinition = {
        rules: {
          'valid-type': {
            given: '$..type',
            then: {
              function: falsy,
            },
          },
        },
        overrides: [
          {
            files: ['**/*.json#/foo/type'],
            rules: {
              'valid-type': 'info',
            },
          },
          {
            files: ['**/*.json'],
            rules: {
              'valid-type': 'error',
            },
          },
          {
            files: ['**/*.json#/bar/type'],
            rules: {
              'valid-type': 'off',
            },
          },
          {
            files: ['**/*.json#/bar/type/foo/type'],
            rules: {
              'valid-type': 'hint',
            },
          },
          {
            files: ['**/*.json#/baz/type/foo/type', '**/*.json#/bar/type/foo/type'],
            rules: {
              'valid-type': 'info',
            },
          },
        ],
      };

      const spectral = new Spectral();

      spectral.setRuleset(new Ruleset(ruleset, { source: path.join(path.dirname(documentUri), 'ruleset.json') }));

      const document = new Document(
        JSON.stringify({
          bar: {
            type: {
              foo: {
                type: 'number',
              },
            },
          },
        }),
        Parsers.Json,
        documentUri,
      );

      const results = await spectral.run(document);
      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-type',
          path: ['bar', 'type', 'foo', 'type'],
          severity: DiagnosticSeverity.Information,
        }),
      ]);
    });

    test('should prefer the closest path', async () => {
      const documentUri = normalize(path.join(__dirname, './__fixtures__/test.json'));
      const ruleset: RulesetDefinition = {
        rules: {
          'valid-type': {
            given: '$..type',
            then: {
              function: falsy,
            },
          },
        },
        overrides: [
          {
            files: ['**/*.json', '**/*.yaml'],
            rules: {
              'valid-type': 'error',
            },
          },
          {
            files: ['**/*.json#/bar/type'],
            rules: {
              'valid-type': 'hint',
            },
          },
          {
            files: ['test.json#/bar'],
            rules: {
              'valid-type': 'off',
            },
          },
        ],
      };

      const spectral = new Spectral();

      spectral.setRuleset(new Ruleset(ruleset, { source: path.join(path.dirname(documentUri), 'ruleset.json') }));

      const document = new Document(
        JSON.stringify({
          bar: {
            type: 'number',
          },
        }),
        Parsers.Json,
        documentUri,
      );

      const results = await spectral.run(document);
      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-type',
          path: ['bar', 'type'],
          severity: DiagnosticSeverity.Hint,
        }),
      ]);
    });
  });
});
