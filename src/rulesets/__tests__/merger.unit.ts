import { DiagnosticSeverity } from '@stoplight/types';
import { IRule } from '../../types';
import { mergeRulesets } from '../merger';

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
    const ruleset = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(ruleset, {
      rules: {
        test: {
          ...JSON.parse(JSON.stringify(baseRule)),
          then: {
            field: 'info',
            function: 'truthy',
            functionOptions: {},
          },
        },
      },
    });

    expect(ruleset).toHaveProperty('rules.test.then', {
      field: 'info',
      function: 'truthy',
      functionOptions: {},
    });
  });

  it('is possible to disable the rule using flag', () => {
    const ruleset = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(ruleset, {
      rules: {
        test: false,
      },
    });

    expect(ruleset).toHaveProperty('rules.test.severity', -1);
  });

  it('supports nested severity', () => {
    const ruleset = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(ruleset, {
      rules: {
        test: false,
      },
    });

    mergeRulesets(ruleset, {
      rules: {
        test: 'error',
      },
    });

    expect(ruleset).toHaveProperty('rules.test.severity', DiagnosticSeverity.Error);
  });

  it('merges the same rules', () => {
    const ruleset = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(ruleset, {
      rules: {
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
      },
    });

    expect(ruleset).toHaveProperty('rules.test.severity', DiagnosticSeverity.Error);
  });

  it('prefers the most recent severity level', () => {
    const ruleset = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(ruleset, {
      rules: {
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
      },
    });

    mergeRulesets(ruleset, {
      rules: {
        test: false,
      },
    });

    mergeRulesets(ruleset, {
      rules: {
        test: true,
      },
    });

    expect(ruleset).toHaveProperty('rules.test.severity', -1);
  });

  it('includes new rules', () => {
    const ruleset = {
      rules: {},
    };

    mergeRulesets(ruleset, {
      rules: {
        example: JSON.parse(JSON.stringify(baseRule)),
      },
    });

    expect(ruleset).toEqual({
      rules: {
        example: {
          ...baseRule,
          severity: DiagnosticSeverity.Warning,
        },
      },
    });
  });

  it('supports array-ish syntax', () => {
    const ruleset = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(ruleset, {
      rules: {
        test: ['off'],
      },
    });

    expect(ruleset).toHaveProperty('rules.test.severity', -1);
  });

  it('supports array-ish syntax', () => {
    const ruleset = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(ruleset, {
      rules: {
        test: ['off'],
      },
    });

    expect(ruleset).toHaveProperty('rules.test.severity', -1);
  });

  it('does not set functionOptions if rule does not implement it', () => {
    const ruleset = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    delete ruleset.rules.test.then.functionOptions;

    mergeRulesets(ruleset, {
      rules: {
        test: ['off', { baz: 'bar' }],
      },
    });

    expect(ruleset).not.toHaveProperty('rules.test.then.functionOptions');
  });

  it('provides support for custom functionOptions via array-ish syntax', () => {
    const ruleset = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(ruleset, {
      rules: {
        test: ['off', { baz: 'bar' }],
      },
    });

    expect(ruleset).toHaveProperty('rules.test.then.functionOptions', { baz: 'bar' });
  });

  it('provides support to disable all rules present in a given ruleset', () => {
    const ruleset = {
      rules: {},
    };

    mergeRulesets(
      ruleset,
      {
        rules: {
          test: JSON.parse(JSON.stringify(baseRule)),
          test2: JSON.parse(JSON.stringify(baseRule)),
        },
      },
      'off',
    );

    expect(ruleset).toHaveProperty('rules.test.severity', -1);
    expect(ruleset).toHaveProperty('rules.test2.severity', -1);
  });

  it('picks up recommended rules', () => {
    const ruleset = {
      rules: {},
    };

    mergeRulesets(
      ruleset,
      {
        rules: {
          test: JSON.parse(JSON.stringify(baseRule)),
          test2: {
            ...JSON.parse(JSON.stringify(baseRule)),
            recommended: false,
          },
        },
      },
      'recommended',
    );

    expect(ruleset).toHaveProperty('rules.test.severity', DiagnosticSeverity.Warning);
    expect(ruleset).toHaveProperty('rules.test2.severity', -1);
  });

  it('sets warning as default severity level if a rule has no severity specified', () => {
    const ruleset = {
      rules: {},
    };

    const baseWithoutSeverity = JSON.parse(JSON.stringify(baseRule));
    delete baseWithoutSeverity.severity;

    mergeRulesets(ruleset, {
      rules: {
        test: baseWithoutSeverity,
        test2: {
          ...JSON.parse(JSON.stringify(baseRule)),
          severity: DiagnosticSeverity.Error,
        },
      },
    });

    expect(ruleset).toHaveProperty('rules.test.severity', DiagnosticSeverity.Warning);
    expect(ruleset).toHaveProperty('rules.test2.severity', DiagnosticSeverity.Error);
  });

  it('picks up all rules', () => {
    const ruleset = {
      rules: {},
    };

    mergeRulesets(
      ruleset,
      {
        rules: {
          test: JSON.parse(JSON.stringify(baseRule)),
          test2: {
            ...JSON.parse(JSON.stringify(baseRule)),
            recommended: false,
          },
        },
      },
      'all',
    );

    expect(ruleset).toHaveProperty('rules.test.severity', DiagnosticSeverity.Warning);
    expect(ruleset).toHaveProperty('rules.test2.severity', DiagnosticSeverity.Warning);
  });
});
