import { IGraphNodeData } from '@stoplight/json-ref-resolver/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { DepGraph } from 'dependency-graph';
import { escapeRegExp, merge } from 'lodash';

import { buildRulesetExceptionCollectionFrom } from '../../setupTests';
import { Document } from '../document';
import * as Parsers from '../parsers';
import { RunRuleCollection, Spectral } from '../spectral';
import { IResolver, RuleCollection } from '../types';
import { RulesetExceptionCollection } from '../types/ruleset';

const oasRuleset = JSON.parse(JSON.stringify(require('../rulesets/oas/index.json')));
const asyncApiRuleset = JSON.parse(JSON.stringify(require('../rulesets/asyncapi/index.json')));
const oasRulesetRules: RuleCollection = oasRuleset.rules;
const asyncApiRulesetRules: RuleCollection = asyncApiRuleset.rules;

describe('spectral', () => {
  describe('loadRuleset', () => {
    test.each([
      ['spectral:oas', oasRulesetRules],
      ['spectral:asyncapi', asyncApiRulesetRules],
    ])('should support loading "%s" built-in ruleset', async (rulesetName, rules) => {
      const s = new Spectral();
      await s.loadRuleset(rulesetName);

      expect(s.rules).toEqual(
        expect.objectContaining(
          Object.entries(rules).reduce<RunRuleCollection>((oasRules, [name, rule]) => {
            oasRules[name] = expect.objectContaining({
              name,
              given: expect.anything(),
              formats: expect.arrayContaining([expect.any(String)]),
              enabled: expect.any(Boolean),
              severity: expect.any(Number),
              then: expect.any(Array),
              message: rule.message ?? null,
              description: rule.description ?? null,
            });

            return oasRules;
          }, {}),
        ),
      );
    });

    test.each([
      ['spectral:oas', oasRulesetRules],
      ['spectral:asyncapi', asyncApiRulesetRules],
    ])('should support loading multiple times the built-in ruleset "%s"', async (rulesetName, expectedRules) => {
      const s = new Spectral();
      await s.loadRuleset([rulesetName, rulesetName]);

      expect(s.rules).toEqual(
        Object.entries(expectedRules).reduce<RunRuleCollection>((oasRules, [name, rule]) => {
          oasRules[name] = expect.objectContaining({
            name,
            given: expect.anything(),
            formats: expect.arrayContaining([expect.any(String)]),
            enabled: expect.any(Boolean),
            severity: expect.any(Number),
            then: expect.any(Array),
            message: rule.message ?? null,
            description: rule.description ?? null,
          });

          return oasRules;
        }, {}),
      );
    });
  });

  describe('setRules & mergeRules', () => {
    test('should not mutate the passing in rules object', () => {
      const givenCustomRuleSet = {
        rule1: {
          given: '$',
          then: {
            function: 'truthy',
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
            function: 'truthy',
          },
        },
      });

      s.mergeRules({
        rule2: {
          message: '',
          given: '$',
          then: {
            function: 'truthy',
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

        const target = new Document(`{"foo":"bar"}`, Parsers.Json, 'foo');

        return expect(s.run(target)).resolves.toStrictEqual([
          {
            code: 'truthy-baz',
            message: 'Baz must be truthy',
            path: ['foo', 'bar', 'baz'],
            range: {
              end: {
                character: 12,
                line: 0,
              },
              start: {
                character: 7,
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

        const document = new Document(
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
          Parsers.Json,
          source,
        );

        s.setRules({
          'pagination-responses-have-x-next-token': {
            description: 'All collection endpoints have the X-Next-Token parameter in responses',
            given: "$.paths..get.responses['200'].headers",
            severity: 'error',
            recommended: true,
            then: { field: 'X-Next-Token', function: 'truthy' },
          },
        });

        return expect(s.run(document)).resolves.toEqual([
          {
            code: 'pagination-responses-have-x-next-token',
            message: 'All collection endpoints have the X-Next-Token parameter in responses',
            path: ['responses', 'GetAgreementsOk', 'headers'],
            range: expect.any(Object),
            severity: DiagnosticSeverity.Error,
            source,
          },
        ]);
      });
    });
  });

  describe('setRuleset', () => {
    const s = new Spectral();

    describe('exceptions handling', () => {
      it.each([['one.yaml#'], ['one.yaml#/'], ['one.yaml#/toto'], ['down/one.yaml#/toto'], ['../one.yaml#/toto']])(
        'throws on relative locations  (location: "%s")',
        location => {
          const exceptions = buildRulesetExceptionCollectionFrom(location);

          expect(() => {
            s.setRuleset({ rules: {}, functions: {}, exceptions });
          }).toThrow(new RegExp(`.+\`${escapeRegExp(location)}\`.+is not a valid uri.+Only absolute Uris are allowed`));
        },
      );

      it.each([
        ['https://dot.com/one.yaml#/toto', 'https://dot.com/one.yaml#/toto'],
        ['/local/one.yaml#/toto', '/local/one.yaml#/toto'],
        ['c:/one.yaml#/toto', 'c:/one.yaml#/toto'],
        ['c:\\one.yaml#/toto', 'c:/one.yaml#/toto'],
      ])('normalizes absolute locations (location: "%s")', (location, expected) => {
        const exceptions = buildRulesetExceptionCollectionFrom(location);

        s.setRuleset({ rules: {}, functions: {}, exceptions });

        const locs = Object.keys(s.exceptions);
        expect(locs).toEqual([expected]);
      });

      it('normalizes exceptions', () => {
        const exceptions: RulesetExceptionCollection = {
          '/test/file.yaml#/a': ['f', 'c', 'd', 'a'],
          '/test/file.yaml#/b': ['1', '3', '3', '2'],
        };

        s.setRuleset({ rules: {}, functions: {}, exceptions });

        expect(s.exceptions).toEqual({
          '/test/file.yaml#/a': ['a', 'c', 'd', 'f'],
          '/test/file.yaml#/b': ['1', '2', '3'],
        });
      });
    });
  });
});
