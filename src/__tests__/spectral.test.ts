import { Cache } from '@stoplight/json-ref-resolver';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { isParsedResult, Spectral } from '../spectral';
import { IParsedResult, RuleFunction } from '../types';

const merge = require('lodash/merge');

const oasRuleset = JSON.parse(JSON.stringify(require('../rulesets/oas/index.json')));
const oas2Ruleset = JSON.parse(JSON.stringify(require('../rulesets/oas2/index.json')));
const oas3Ruleset = JSON.parse(JSON.stringify(require('../rulesets/oas3/index.json')));

describe('spectral', () => {
  describe('loadRuleset', () => {
    test('should support loading built-in rulesets', async () => {
      const s = new Spectral();
      await s.loadRuleset('spectral:oas2');

      expect(s.rules).toEqual(
        [...Object.entries(oasRuleset.rules), ...Object.entries(oas2Ruleset.rules)].reduce<Dictionary<unknown>>(
          (oasRules, [name, rule]) => {
            oasRules[name] = {
              name,
              ...rule,
              formats: expect.arrayContaining([expect.any(String)]),
              severity: expect.any(Number),
              then: expect.any(Object),
            };

            return oasRules;
          },
          {},
        ),
      );
    });

    test('should support loading multiple built-in rulesets', async () => {
      const s = new Spectral();
      await s.loadRuleset('spectral:oas2', 'spectral:oas3');

      expect(s.rules).toEqual(
        [
          ...Object.entries(oasRuleset.rules),
          ...Object.entries(oas2Ruleset.rules),
          ...Object.entries(oas3Ruleset.rules),
        ].reduce<Dictionary<unknown>>((oasRules, [name, rule]) => {
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

  describe('addRules & mergeRules', () => {
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
      s.addRules(givenCustomRuleSet);

      s.mergeRules({
        rule1: {
          severity: DiagnosticSeverity.Error,
        },
      });

      expect(expectedCustomRuleSet).toEqual(givenCustomRuleSet);
    });

    test('should update/append on the current rules', () => {
      const s = new Spectral();

      s.addRules({
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

  describe('addRuleDeclarations', () => {
    describe('boolean value', () => {
      test('should update the name rule recommended property', () => {
        const s = new Spectral();

        s.addRules({
          // @ts-ignore
          rule1: {
            message: '',
            given: '$',
            recommended: false,
            then: {
              function: RuleFunction.TRUTHY,
            },
          },
        });

        s.applyRuleDeclarations({
          rule1: true,
        });

        expect(Object.keys(s.rules)).toEqual(['rule1']);
        expect(s.rules.rule1.recommended).toBe(true);
      });
    });
  });

  describe('when a $ref appears', () => {
    test('will call the resolver with target', async () => {
      const fakeResolver = {
        resolve: jest.fn(() => Promise.resolve([])),
      };

      const s = new Spectral({
        resolver: fakeResolver as any,
      });

      const target = { foo: 'bar' };

      await s.run(target);

      expect(fakeResolver.resolve).toBeCalledWith(target, {
        authority: undefined,
        uriCache: expect.any(Cache),
        parseResolveResult: expect.any(Function),
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
