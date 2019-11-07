import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import { IGraphNodeData } from '@stoplight/json-ref-resolver/types';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { DepGraph } from 'dependency-graph';
import { isParsedResult, Spectral } from '../spectral';
import { IParsedResult, IResolver, IRunRule, RuleFunction } from '../types';

const merge = require('lodash/merge');

const oasRuleset = JSON.parse(JSON.stringify(require('../rulesets/oas/index.json')));
const oas2Ruleset = JSON.parse(JSON.stringify(require('../rulesets/oas2/index.json')));
const oas3Ruleset = JSON.parse(JSON.stringify(require('../rulesets/oas3/index.json')));

const oasRulesetRules: Dictionary<IRunRule, string> = oasRuleset.rules;
const oas2RulesetRules: Dictionary<IRunRule, string> = oas2Ruleset.rules;
const oas3RulesetRules: Dictionary<IRunRule, string> = oas3Ruleset.rules;

describe('spectral', () => {
  describe('loadRuleset', () => {
    test('should support loading built-in rulesets', async () => {
      const s = new Spectral();
      await s.loadRuleset('spectral:oas2');

      expect(s.rules).toEqual(
        expect.objectContaining(
          [...Object.entries(oasRulesetRules), ...Object.entries(oas2RulesetRules)].reduce<
            Dictionary<IRunRule, string>
          >((oasRules, [name, rule]) => {
            oasRules[name] = {
              name,
              ...rule,
              formats: expect.arrayContaining([expect.any(String)]),
              severity: expect.any(Number),
              then: expect.any(Object),
            };

            return oasRules;
          }, {}),
        ),
      );
    });

    test('should support loading multiple built-in rulesets', async () => {
      const s = new Spectral();
      await s.loadRuleset(['spectral:oas2', 'spectral:oas3']);

      expect(s.rules).toEqual(
        [
          ...Object.entries(oasRulesetRules),
          ...Object.entries(oas2RulesetRules),
          ...Object.entries(oas3RulesetRules),
        ].reduce<Dictionary<IRunRule, string>>((oasRules, [name, rule]) => {
          oasRules[name] = {
            name,
            ...rule,
            formats: expect.arrayContaining([expect.any(String)]),
            severity: expect.any(Number),
            then: expect.any(Object),
          };

          return oasRules;
        }, {}),
      );
    });
  });

  describe('setRules & mergeRules', () => {
    test('should not mutate the passing in rules object', () => {
      const givenCustomRuleSet = {
        rule1: {
          summary: '',
          given: '$',
          then: {
            function: RuleFunction.TRUTHY,
          },
        },
      };

      // deep copy
      const expectedCustomRuleSet = merge({}, givenCustomRuleSet);

      const s = new Spectral();
      s.setRules(givenCustomRuleSet);

      s.mergeRules({
        rule1: {
          severity: DiagnosticSeverity.Error,
        },
      });

      expect(expectedCustomRuleSet).toEqual(givenCustomRuleSet);
    });

    test('should update/append on the current rules', () => {
      const s = new Spectral();

      s.setRules({
        // @ts-ignore
        rule1: {
          message: '',
          given: '$',
          severity: DiagnosticSeverity.Warning,
          then: {
            function: RuleFunction.TRUTHY,
          },
        },
      });

      s.mergeRules({
        rule2: {
          message: '',
          given: '$',
          then: {
            function: RuleFunction.TRUTHY,
          },
        },
      });

      expect(Object.keys(s.rules)).toEqual(['rule1', 'rule2']);

      s.mergeRules({
        rule1: {
          severity: DiagnosticSeverity.Error,
        },
      });

      expect(Object.keys(s.rules)).toEqual(['rule1', 'rule2']);
      expect(s.rules.rule1.severity).toBe(DiagnosticSeverity.Error);
    });
  });

  describe('when a $ref appears', () => {
    describe('and a custom resolver is provided', () => {
      test('will call the resolver with target', async () => {
        const customResolver: IResolver = {
          resolve: jest.fn(async () => ({
            result: {},
            refMap: {},
            graph: new DepGraph<IGraphNodeData>(),
            errors: [],
          })),
        };

        const s = new Spectral({
          resolver: customResolver,
        });

        const target = { foo: 'bar' };

        await s.run(target);

        expect(customResolver.resolve).toBeCalledWith(target, {
          authority: undefined,
          parseResolveResult: expect.any(Function),
        });
      });

      test('should handle lack of information about $refs gracefully', () => {
        const customResolver: IResolver = {
          resolve: jest.fn(async () => ({
            result: {
              foo: {
                bar: {
                  baz: '',
                },
              },
            },
            refMap: {},
            graph: new DepGraph<IGraphNodeData>(),
            errors: [],
          })),
        };

        const s = new Spectral({
          resolver: customResolver,
        });

        s.setRules({
          'truthy-baz': {
            given: '$.foo.bar.baz',
            message: 'Baz must be truthy',
            severity: DiagnosticSeverity.Error,
            recommended: true,
            then: {
              function: 'truthy',
            },
          },
        });

        const target: IParsedResult = {
          parsed: parseWithPointers(`{"foo":"bar"}`),
          getLocationForJsonPath,
          source: 'foo',
        };

        return expect(s.run(target)).resolves.toStrictEqual([
          {
            code: 'truthy-baz',
            message: 'Baz must be truthy',
            path: ['foo', 'bar', 'baz'],
            range: {
              end: {
                character: 0,
                line: 0,
              },
              start: {
                character: 0,
                line: 0,
              },
            },
            severity: DiagnosticSeverity.Error,
            source: void 0,
          },
        ]);
      });

      test('should recognize the source of local $refs', () => {
        const s = new Spectral();
        const source = 'foo.yaml';

        const parsedResult: IParsedResult = {
          getLocationForJsonPath,
          source,
          parsed: parseWithPointers(
            JSON.stringify(
              {
                paths: {
                  '/agreements': {
                    get: {
                      description: 'Get some Agreements',
                      responses: {
                        '200': {
                          $ref: '#/responses/GetAgreementsOk',
                        },
                        default: {},
                      },
                      summary: 'List agreements',
                      tags: ['agreements', 'pagination'],
                    },
                  },
                },
                responses: {
                  GetAgreementsOk: {
                    description: 'Successful operation',
                    headers: {},
                  },
                },
              },
              null,
              2,
            ),
          ),
        };

        s.setRules({
          'pagination-responses-have-x-next-token': {
            description: 'All collection endpoints have the X-Next-Token parameter in responses',
            given: "$.paths..get.responses['200'].headers",
            severity: 'error',
            recommended: true,
            then: { field: 'X-Next-Token', function: 'truthy' },
          },
        });

        return expect(s.run(parsedResult)).resolves.toEqual([
          {
            code: 'pagination-responses-have-x-next-token',
            message: 'All collection endpoints have the X-Next-Token parameter in responses',
            path: ['paths', '/agreements', 'get', 'responses', '200', 'headers'],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Error,
            source,
          },
        ]);
      });
    });
  });

  test('isParsedResult correctly identifies objects that fulfill the IParsedResult interface', () => {
    // @ts-ignore
    expect(isParsedResult()).toBe(false);

    expect(isParsedResult('')).toBe(false);
    expect(isParsedResult([])).toBe(false);
    expect(isParsedResult({})).toBe(false);
    expect(
      isParsedResult({
        parsed: undefined,
      }),
    ).toBe(false);

    expect(
      isParsedResult({
        parsed: [],
      }),
    ).toBe(false);

    expect(
      isParsedResult({
        parsed: {
          data: {},
        },
      }),
    ).toBe(false);

    const obj: IParsedResult = {
      getLocationForJsonPath: jest.fn(),
      parsed: {
        data: {},
        ast: {},
        lineMap: [],
        diagnostics: [],
      },
    };
    expect(isParsedResult(obj)).toBe(true);
  });
});
