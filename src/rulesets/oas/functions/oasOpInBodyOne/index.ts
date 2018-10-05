import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleResult, Rule } from '../../../../types';

export const oasOpInBodyOne: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const parameters: any[] = _object;

  const res = ensureRule(() => {
    parameters.filter(param => param.in === 'body').length.should.belowOrEqual(1);
  }, ruleMeta);

  if (res) results.push(res);

  return results;
};
