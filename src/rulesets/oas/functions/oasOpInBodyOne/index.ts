import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleOpts, IRuleResult, Rule } from '../../../../types';

export const oasOpInBodyOne: IRuleFunction<Rule> = (opts: IRuleOpts<Rule>) => {
  const results: IRuleResult[] = [];

  const { object, meta } = opts;
  const parameters: any[] = object;

  const res = ensureRule(() => {
    parameters.filter(param => param.in === 'body').length.should.belowOrEqual(1);
  }, meta);

  if (res) results.push(res);

  return results;
};
