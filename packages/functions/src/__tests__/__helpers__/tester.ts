import {
  Spectral,
  Document,
  RuleDefinition,
  Ruleset,
  IRuleResult,
  RulesetFunction,
  RulesetFunctionWithValidator,
} from '@stoplight/spectral-core';

export default async function <O = unknown>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: RulesetFunction<any, any> | RulesetFunctionWithValidator<any, any>,
  input: unknown,
  opts: O | null = null,
  rule?: Partial<Omit<RuleDefinition, 'then'>> & { then?: Partial<RuleDefinition['then']> },
): Promise<Pick<IRuleResult, 'path' | 'message'>[]> {
  const s = new Spectral();
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

  try {
    const results = await s.run(input instanceof Document ? input : JSON.stringify(input));
    return results
      .filter(result => result.code === 'my-rule')
      .map(error => ({
        path: error.path,
        message: error.message,
      }));
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }

    const errors = Array.isArray((error as Error & { errors?: unknown }).errors)
      ? (error as Error & { errors: unknown[] }).errors
      : [error];

    if (errors.length === 1) {
      throw getCause(errors[0]);
    } else {
      throw error;
    }
  }
}

function getCause(error: unknown): unknown {
  if (error instanceof Error && 'cause' in (error as Error & { cause?: unknown })) {
    return getCause((error as Error & { cause?: unknown }).cause);
  }

  return error;
}
