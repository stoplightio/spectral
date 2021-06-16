import type { IRule, IRuleResult, RulesetFunction, RulesetFunctionWithValidator } from '../../../types';
import { Spectral } from '../../../spectral';
import { Document } from '../../../document';

export default async function <O = unknown>(
  fn: RulesetFunction<any, any> | RulesetFunctionWithValidator<any, any>,
  input: unknown,
  opts: O | null = null,
  rule?: Partial<Omit<IRule, 'then'>> & { then?: Partial<IRule['then']> },
): Promise<Pick<IRuleResult, 'path' | 'message'>[]> {
  const s = new Spectral();
  s.setFunctions({ [fn.name]: fn });
  s.setRules({
    'my-rule': {
      given: '$',
      ...rule,
      then: {
        ...rule?.then,
        function: fn.name,
        functionOptions: opts,
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
