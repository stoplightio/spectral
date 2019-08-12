import { DiagnosticSeverity } from '@stoplight/types';
import { IRule } from '../../types';
import { mergeRules } from '../mergers/rules';

describe('Rulesets merger', () => {
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
      { severity: 'off' },
    );

    expect(rules).toHaveProperty('test.severity', -1);
    expect(rules).toHaveProperty('test2.severity', -1);
  });

  it('picks up recommended rules', () => {
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
      { severity: 'recommended' },
    );

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Warning);
    expect(rules).toHaveProperty('test2.severity', -1);
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
      { severity: 'all' },
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
      { severity: 'all' },
    );

    expect(rules).toHaveProperty('test.severity', DiagnosticSeverity.Hint);
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

  it('injects spec-scoped formats to each rule without a format', () => {
    const ruleset: IRulesetFile = {
      rules: {},
    };

    mergeRulesets(ruleset, {
      formats: ['oas2', 'oas3'],
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
        test2: JSON.parse(JSON.stringify(baseRule)),
      },
    });

    expect(ruleset).not.toHaveProperty('formats'); // makes sure we do not attach formats in the final output
    expect(ruleset.rules).toEqual({
      test: expect.objectContaining({
        formats: ['oas2', 'oas3'],
      }),
      test2: expect.objectContaining({
        formats: ['oas2', 'oas3'],
      }),
    });
  });

  it('preserves own formats of a rule if any declared', () => {
    const ruleset: IRulesetFile = {
      rules: {},
    };

    mergeRulesets(ruleset, {
      formats: ['oas2', 'oas3'],
      rules: {
        test: {
          ...JSON.parse(JSON.stringify(baseRule)),
          formats: ['markdown'],
        },
        test2: JSON.parse(JSON.stringify(baseRule)),
      },
    });

    expect(ruleset).not.toHaveProperty('formats'); // makes sure we do not attach formats in the final output
    expect(ruleset.rules).toEqual({
      test: expect.objectContaining({
        formats: ['markdown'],
      }),
      test2: expect.objectContaining({
        formats: ['oas2', 'oas3'],
      }),
    });
  });
});
