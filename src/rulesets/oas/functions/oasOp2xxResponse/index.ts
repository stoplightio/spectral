import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleResult, Rule } from '../../../../types';

export const oasOp2xxResponse: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const responses = Object.keys(_object);

  const res = ensureRule(() => {
    responses
      .filter(response => Number(response) >= 200 && Number(response) < 300)
      .length.should.aboveOrEqual(1);
  }, ruleMeta);

  if (res) results.push(res);

  return results;
};
