import { IRule } from '../../types';
import { mergeRulesets } from '../merger';

describe('Rulesets merger', () => {
  const baseRule: IRule = {
    summary: 'Operation must have at least one `2xx` response.',
    given:
      "$..paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' || @property === 'delete' || @property === 'options' || @property === 'head' || @property === 'patch' || @property === 'trace' )]",
    then: {
      field: 'responses',
      function: 'oasOp2xxResponse',
      functionOptions: {},
    },
    recommended: true,
    severity: 'warn',
  };

  it('is possible to disable the rule using flag', () => {
    const config = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(config, {
      rules: {
        test: false,
      },
    });

    expect(config).toHaveProperty('rules.test.severity', 'off');
  });

  it('supports nested severity', () => {
    const config = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(config, {
      rules: {
        test: false,
      },
    });

    mergeRulesets(config, {
      rules: {
        test: 'error',
      },
    });

    expect(config).toHaveProperty('rules.test.severity', 'error');
  });

  it('merges the same rules', () => {
    const config = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(config, {
      rules: {
        test: {
          summary: 'Operation must have at least one `2xx` response.',
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

    expect(config).toHaveProperty('rules.test.severity', 'error');
  });

  it('prefers the most recent severity level', () => {
    const config = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(config, {
      rules: {
        test: {
          summary: 'Operation must have at least one `2xx` response.',
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

    mergeRulesets(config, {
      rules: {
        test: false,
      },
    });

    mergeRulesets(config, {
      rules: {
        test: true,
      },
    });

    expect(config).toHaveProperty('rules.test.severity', 'off');
  });

  it('includes new rules', () => {
    const config = {
      rules: {},
    };

    mergeRulesets(config, {
      rules: {
        example: JSON.parse(JSON.stringify(baseRule)),
      },
    });

    expect(config).toEqual({
      rules: {
        example: baseRule,
      },
    });
  });

  it('supports array-ish syntax', () => {
    const config = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(config, {
      rules: {
        test: ['off'],
      },
    });

    expect(config).toHaveProperty('rules.test.severity', 'off');
  });

  it('supports array-ish syntax', () => {
    const config = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(config, {
      rules: {
        test: ['off'],
      },
    });

    expect(config).toHaveProperty('rules.test.severity', 'off');
  });

  it('does not set functionOptions if rule does not implement it', () => {
    const config = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    delete config.rules.test.then.functionOptions;

    mergeRulesets(config, {
      rules: {
        test: ['off', { baz: 'bar' }],
      },
    });

    expect(config).not.toHaveProperty('rules.test.then.functionOptions');
  });

  it('provides support for custom functionOptions via array-ish syntax', () => {
    const config = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeRulesets(config, {
      rules: {
        test: ['off', { baz: 'bar' }],
      },
    });

    expect(config).toHaveProperty('rules.test.then.functionOptions', { baz: 'bar' });
  });

  it('provides support to disable all rules present in a given ruleset', () => {
    const config = {
      rules: {},
    };

    mergeRulesets(
      config,
      {
        rules: {
          test: JSON.parse(JSON.stringify(baseRule)),
          test2: JSON.parse(JSON.stringify(baseRule)),
        },
      },
      'off',
    );

    expect(config).toHaveProperty('rules.test.severity', 'off');
    expect(config).toHaveProperty('rules.test2.severity', 'off');
  });

  it('picks up recommended rules', () => {
    const config = {
      rules: {},
    };

    mergeRulesets(
      config,
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

    expect(config).toHaveProperty('rules.test.severity', 'warn');
    expect(config).toHaveProperty('rules.test2.severity', 'off');
  });

  it('picks up all rules', () => {
    const config = {
      rules: {},
    };

    mergeRulesets(
      config,
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

    expect(config).toHaveProperty('rules.test.severity', 'warn');
    expect(config).toHaveProperty('rules.test2.severity', 'warn');
  });
});
