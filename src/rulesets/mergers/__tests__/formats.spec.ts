import { IRule } from '../../../types';
import { mergeFormats } from '../formats';

describe('Ruleset formats merging', () => {
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

  it('injects spec-scoped formats to each rule without a format', () => {
    const rules = {
      test: JSON.parse(JSON.stringify(baseRule)),
      test2: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeFormats(rules, ['oas2', 'oas3']);

    expect(rules).toEqual({
      test: expect.objectContaining({
        formats: ['oas2', 'oas3'],
      }),
      test2: expect.objectContaining({
        formats: ['oas2', 'oas3'],
      }),
    });
  });

  it('preserves own formats of a rule if any declared', () => {
    const rules = {
      test: {
        ...JSON.parse(JSON.stringify(baseRule)),
        formats: ['markdown'],
      },
      test2: JSON.parse(JSON.stringify(baseRule)),
    };

    mergeFormats(rules, ['oas2', 'oas3']);

    expect(rules).toEqual({
      test: expect.objectContaining({
        formats: ['markdown'],
      }),
      test2: expect.objectContaining({
        formats: ['oas2', 'oas3'],
      }),
    });
  });
});
