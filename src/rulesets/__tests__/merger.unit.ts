import { IRule } from '../../types';
import { mergeConfigs } from '../merger';

describe('Config merger', () => {
  const baseRule: IRule = {
    summary: 'Operation must have at least one `2xx` response.',
    given:
      "$..paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' || @property === 'delete' || @property === 'options' || @property === 'head' || @property === 'patch' || @property === 'trace' )]",
    then: {
      field: 'responses',
      function: 'oasOp2xxResponse',
    },
    severity: 'warn',
  };

  it('is possible to disable the rule using flag', () => {
    const config = {
      rules: {
        test: JSON.parse(JSON.stringify(baseRule)),
      },
    };

    mergeConfigs(config, {
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

    mergeConfigs(config, {
      rules: {
        test: false,
      },
    });

    mergeConfigs(config, {
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

    mergeConfigs(config, {
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

    mergeConfigs(config, {
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

    mergeConfigs(config, {
      rules: {
        test: false,
      },
    });

    mergeConfigs(config, {
      rules: {
        test: true,
      },
    });

    expect(config).toHaveProperty('rules.test.severity', 'error');
  });

  it('includes new rules', () => {
    const config = {
      rules: {},
    };

    mergeConfigs(config, {
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
});
