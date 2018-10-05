import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleResult, Rule } from '../../../../types';

export const oasOpParametersUnique: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const parameters: any[] = _object;

  parameters.forEach((parameter, index) => {
    if (!parameter.$ref) {
      const meta = { ...ruleMeta, path: ruleMeta.path.concat(index) };

      const res = ensureRule(() => {
        parameters
          .filter((p: any) => p.in === parameter.in && p.name === parameter.name && !parameter.$ref)
          .length.should.equal(1);
      }, meta);

      if (res) {
        results.push(res);
      }
    }
  });

  return results;
};
