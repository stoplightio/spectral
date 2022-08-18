import {
  Spectral,
  Document,
  RuleDefinition,
  Ruleset,
  IRuleResult,
  RulesetFunction,
  RulesetFunctionWithValidator,
  RulesetValidationError,
} from '@stoplight/spectral-core';
import { isAggregateError } from '@stoplight/spectral-core/src/guards/isAggregateError';

export default async function <O = unknown>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: RulesetFunction<any, any> | RulesetFunctionWithValidator<any, any>,
  input: unknown,
  opts: O | null = null,
  rule?: Partial<Omit<RuleDefinition, 'then'>> & { then?: Partial<RuleDefinition['then']> },
): Promise<Pick<IRuleResult, 'path' | 'message'>[]> {
  const s = new Spectral();
  try {
    s.setRuleset({
      rules: {
        'my-rule': {
          given: '$',
          ...rule,
          then: {
            ...(rule?.then as Ruleset['rules']['then']),
            function: fn,
            functionOptions: opts,
          },
        },
      },
    });
  } catch (ex) {
    if (isAggregateError(ex)) {
      for (const e of ex.errors) {
        if (e instanceof RulesetValidationError) {
          e.path.length = 0;
        }
      }
    }

    throw ex;
  }

  const results = await s.run(input instanceof Document ? input : JSON.stringify(input));
  return results
    .filter(result => result.code === 'my-rule')
    .map(error => ({
      path: error.path,
      message: error.message,
    }));
}
