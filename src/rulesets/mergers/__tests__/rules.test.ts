import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { IRule } from '../../../types';
import { FileRuleCollection } from '../../../types/ruleset';
import { mergeRules } from '../rules';

describe('Ruleset rules merging', () => {
  const baseRule: IRule = {
    message: 'Operation must have at least one `2xx` response.',
    given:
      "$..paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' || @property === 'delete' || @property === 'options' || @property === 'head' || @property === 'patch' || @property === 'trace' )]",
    then: {
      field: 'responses',
      function: 'oasOp2xxResponse',
      functionOptions: {
        foo: 'bar',
      },
    },
    recommended: true,
    severity: 'warn',
  };

  it('performs a shallow merging', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeRules(rules, {
      test: {
        ...JSON.parse(JSON.stringify(baseRule)),
        then: {
          field: 'info',
          function: 'truthy',
          functionOptions: {},
        },
      },
    });

    expect(rules).toHaveProperty('test.then', {
      field: 'info',
      function: 'truthy',
      functionOptions: {},
    });
  });

  it('is possible to disable the rule using flag', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeRules(rules, {
      test: false,
    });

    expect(rules).toHaveProperty('test.severity', -1);
  });

  it('supports nested severity', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeRules(rules, {
      test: false,
    });

    mergeRules(rules, {
      test: 'error',
    });

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Error);
  });

  it('merges the same rules', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeRules(rules, {
      test: {
        message: 'Operation must have at least one `2xx` response.',
        given:
          "$..paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' || @property === 'delete' || @property === 'options' || @property === 'head' || @property === 'patch' || @property === 'trace' )]",
        then: {
          field: 'responses',
          function: 'oasOp2xxResponse',
        },
        severity: 'error',
      },
    });

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Error);
  });

  it('prefers the root definition severity level', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeRules(rules, {
      test: {
        message: 'Operation must have at least one `2xx` response.',
        given:
          "$..paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' || @property === 'delete' || @property === 'options' || @property === 'head' || @property === 'patch' || @property === 'trace' )]",
        then: {
          field: 'responses',
          function: 'oasOp2xxResponse',
        },
        severity: 'error',
      },
    });

    mergeRules(rules, {
      test: false,
    });

    mergeRules(rules, {
      test: true,
    });

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Error);
  });

  it('includes new rules', () => {
    const rules = {};

    mergeRules(rules, {
      example: JSON.parse(JSON.stringify(baseRule)),
    });

    expect(rules).toEqual({
      example: {
        ...baseRule,
        severity: DiagnosticSeverity.Warning,
      },
    });
  });

  it('supports array-ish syntax', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeRules(rules, {
      test: ['off'],
    });

    expect(rules).toHaveProperty('test.severity', -1);
  });

  it('does not set functionOptions if rule does not implement it', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    delete rules.test.then.functionOptions;

    mergeRules(rules, {
      test: ['off', { baz: 'bar' }],
    });

    expect(rules).not.toHaveProperty('test.then.functionOptions');
  });

  it('provides support for custom functionOptions via array-ish syntax', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeRules(rules, {
      test: ['off', { baz: 'bar' }],
    });

    expect(rules).toHaveProperty('test.then.functionOptions', { baz: 'bar' });
  });

  it('provides support to disable all rules present in a given ruleset', () => {
    const rules = {};

    mergeRules(
      rules,
      {
        test: JSON.parse(JSON.stringify(baseRule)),
        test2: JSON.parse(JSON.stringify(baseRule)),
      },
      'off',
    );

    expect(rules).toHaveProperty('test.severity', -1);
    expect(rules).toHaveProperty('test2.severity', -1);
  });

  it('picks up recommended rules', () => {
    const rules: Dictionary<IRule, string> = {};

    const test3 = JSON.parse(JSON.stringify(baseRule));
    delete test3.recommended;

    mergeRules(
      rules,
      {
        test: JSON.parse(JSON.stringify(baseRule)),
        test2: {
          ...JSON.parse(JSON.stringify(baseRule)),
          recommended: false,
        },
        test3,
      },
      'recommended',
    );

    expect(rules.test.recommended).toBe(true);
    expect(rules.test2.recommended).toBe(false);
    expect(rules.test3.recommended).toBe(true);

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Warning);
    expect(rules).toHaveProperty('test2.severity', -1);
    expect(rules).toHaveProperty('test3.severity', DiagnosticSeverity.Warning);
  });

  it('rules with no severity and no recommended set are treated as warnings', () => {
    const rules = {};

    const rule = JSON.parse(JSON.stringify(baseRule));
    delete rule.recommended;
    delete rule.severity;

    mergeRules(
      rules,
      {
        rule,
      },
      'recommended',
    );

    expect(rules).toHaveProperty('rule.severity', DiagnosticSeverity.Warning);
  });

  it('rules with recommended set to false are disabled', () => {
    const rules = {};

    mergeRules(
      rules,
      {
        rule: {
          ...JSON.parse(JSON.stringify(baseRule)),
          recommended: false,
        },
      },
      'recommended',
    );

    expect(rules).toHaveProperty('rule.severity', -1);
  });

  it('sets warning as default severity level if a rule has no severity specified', () => {
    const rules = {};

    const baseWithoutSeverity = JSON.parse(JSON.stringify(baseRule));
    delete baseWithoutSeverity.severity;

    mergeRules(rules, {
      test: baseWithoutSeverity,
      test2: {
        ...JSON.parse(JSON.stringify(baseRule)),
        severity: DiagnosticSeverity.Error,
      },
    });

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Warning);
    expect(rules).toHaveProperty('test2.severity', DiagnosticSeverity.Error);
  });

  it('picks up all rules', () => {
    const rules = {};

    mergeRules(
      rules,
      {
        test: JSON.parse(JSON.stringify(baseRule)),
        test2: {
          ...JSON.parse(JSON.stringify(baseRule)),
          recommended: false,
        },
      },
      'all',
    );

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Warning);
    expect(rules).toHaveProperty('test2.severity', DiagnosticSeverity.Warning);
  });

  it('overrides existing severity if no ruleset severity is given', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeRules(rules, {
      test: 'hint',
    });

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Hint);
  });

  it('overrides existing severity if all ruleset severity is given', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeRules(
      rules,
      {
        test: 'hint',
      },
      'all',
    );

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Hint);
  });

  describe('inheriting rules with no explicit severity levels', () => {
    let rules: FileRuleCollection;

    beforeEach(() => {
      rules = {
        rule: {
          given: '',
          then: { function: '' },
          recommended: true,
        },
        'rule-with-no-recommended': {
          given: '',
          then: { function: '' },
        },
        'optional-rule': {
          given: '',
          then: { function: '' },
          recommended: false,
        },
      };
    });

    it('sets warning as a default', () => {
      const newRules = mergeRules({}, rules);

      const custom = {
        rule: true,
        'rule-with-no-recommended': true,
        'optional-rule': true,
      };

      expect(mergeRules(newRules, custom)).toEqual({
        rule: expect.objectContaining({
          recommended: true,
          severity: DiagnosticSeverity.Warning,
        }),
        'rule-with-no-recommended': expect.objectContaining({
          severity: DiagnosticSeverity.Warning,
        }),
        'optional-rule': expect.objectContaining({
          recommended: false,
          severity: DiagnosticSeverity.Warning,
        }),
      });
    });

    it('sets warning as a default even when all rules were disabled', () => {
      const newRules = mergeRules({}, rules, 'off');

      const custom = {
        rule: true,
        'rule-with-no-recommended': true,
        'optional-rule': true,
      };

      expect(mergeRules(newRules, custom)).toEqual({
        rule: expect.objectContaining({
          recommended: true,
          severity: DiagnosticSeverity.Warning,
        }),
        'rule-with-no-recommended': expect.objectContaining({
          severity: DiagnosticSeverity.Warning,
        }),
        'optional-rule': expect.objectContaining({
          recommended: false,
          severity: DiagnosticSeverity.Warning,
        }),
      });
    });

    it('respects ruleset severity', () => {
      expect(mergeRules({}, rules, 'all')).toEqual({
        rule: expect.objectContaining({
          recommended: true,
          severity: DiagnosticSeverity.Warning,
        }),
        'rule-with-no-recommended': expect.objectContaining({
          severity: DiagnosticSeverity.Warning,
        }),
        'optional-rule': expect.objectContaining({
          recommended: false,
          severity: DiagnosticSeverity.Warning,
        }),
      });

      expect(mergeRules({}, rules, 'recommended')).toEqual({
        rule: expect.objectContaining({
          recommended: true,
          severity: DiagnosticSeverity.Warning,
        }),
        'rule-with-no-recommended': expect.objectContaining({
          severity: DiagnosticSeverity.Warning,
        }),
        'optional-rule': expect.objectContaining({
          recommended: false,
          severity: -1,
        }),
      });

      expect(mergeRules({}, rules, 'off')).toEqual({
        rule: expect.objectContaining({
          recommended: true,
          severity: -1,
        }),
        'rule-with-no-recommended': expect.objectContaining({
          severity: -1,
        }),
        'optional-rule': expect.objectContaining({
          recommended: false,
          severity: -1,
        }),
      });
    });
  });

  it('given invalid rule value should throw', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
    };

    expect(
      mergeRules.bind(null, rules, {
        test() {
          // should never happen
        },
      } as any),
    ).toThrow('Invalid value for a rule');
  });
});
