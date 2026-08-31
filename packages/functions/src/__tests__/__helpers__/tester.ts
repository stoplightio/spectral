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

  const results = await s.run(input instanceof Document ? input : JSON.stringify(input));
  return results
    .filter(result => result.code === 'my-rule')
    .map(error => ({
      path: error.path,
      message: error.message,
    }));
}
