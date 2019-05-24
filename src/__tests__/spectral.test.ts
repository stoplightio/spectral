import { DiagnosticSeverity } from '@stoplight/types';
import { isParsedResult, Spectral } from '../spectral';
import { IParsedResult, RuleFunction } from '../types';

const merge = require('lodash/merge');

describe('spectral', () => {
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
          summary: '',
          given: '$',
          severity: DiagnosticSeverity.Warning,
          then: {
            function: RuleFunction.TRUTHY,
          },
        },
      });

      s.mergeRules({
        rule2: {
          summary: '',
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
      test('should update the name rule enabled property', () => {
        const s = new Spectral();

        s.addRules({
          // @ts-ignore
          rule1: {
            summary: '',
            given: '$',
            enabled: false,
            then: {
              function: RuleFunction.TRUTHY,
            },
          },
        });

        s.applyRuleDeclarations({
          rule1: true,
        });

        expect(Object.keys(s.rules)).toEqual(['rule1']);
        expect(s.rules.rule1.enabled).toBe(true);
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

      expect(fakeResolver.resolve).toBeCalledWith(target);
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
