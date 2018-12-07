import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleOpts, IRuleResult, Rule } from '../../../../types';
import { IFunctionPaths } from '../../../../types/spectral';

export const oasOp2xxResponse: IRuleFunction<Rule> = (opts: IRuleOpts<Rule>, paths: IFunctionPaths) => {
  const results: IRuleResult[] = [];

  const { object } = opts;
  const responses = Object.keys(object);

  const res = ensureRule(() => {
    responses.filter(response => Number(response) >= 200 && Number(response) < 300).length.should.aboveOrEqual(1);
  }, paths.given);

  if (res) results.push(res);

  return results;
};
