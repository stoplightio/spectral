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
  } catch (e: unknown) {
    if (
      e instanceof Error &&
      Array.isArray((e as Error & { errors?: unknown }).errors) &&
      (e as Error & { errors: unknown[] }).errors.length === 1
    ) {
      const actualError = (e as Error & { errors: [unknown] }).errors[0];
      throw actualError instanceof Error && 'cause' in (actualError as Error & { cause?: unknown })
        ? (actualError as Error & { cause: unknown }).cause
        : actualError;
    } else {
      throw e;
    }
  }
}
