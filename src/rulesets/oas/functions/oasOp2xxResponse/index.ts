import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleOpts, IRuleResult, Rule } from '../../../../types';

export const oasOp2xxResponse: IRuleFunction<Rule> = (opts: IRuleOpts<Rule>) => {
  const results: IRuleResult[] = [];

  const { object, meta } = opts;
  const responses = Object.keys(object);

  const res = ensureRule(() => {
    responses.filter(response => Number(response) >= 200 && Number(response) < 300).length.should.aboveOrEqual(1);
  }, meta);

  if (res) results.push(res);

  return results;
};
