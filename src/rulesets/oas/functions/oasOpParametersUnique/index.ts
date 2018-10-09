import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleOpts, IRuleResult, Rule } from '../../../../types';

export const oasOpParametersUnique: IRuleFunction<Rule> = (opts: IRuleOpts<Rule>) => {
  const results: IRuleResult[] = [];

  const { object, meta } = opts;
  const parameters: any[] = object;

  parameters.forEach((parameter, index) => {
    if (!parameter.$ref) {
      const m = { ...meta, path: meta.path.concat(index) };

      const res = ensureRule(() => {
        parameters
          .filter((p: any) => p.in === parameter.in && p.name === parameter.name && !parameter.$ref)
          .length.should.equal(1);
      }, m);

      if (res) {
        results.push(res);
      }
    }
  });

  return results;
};
