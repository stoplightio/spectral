import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleOpts, IRuleResult, Rule } from '../../../../types';

export const oasOpNoBodyFormData: IRuleFunction<Rule> = (opts: IRuleOpts<Rule>) => {
  const results: IRuleResult[] = [];

  const { object, meta } = opts;
  const parameters: any[] = object;

  const inBody = parameters.filter(param => param.in === 'body').length;
  const inFormData = parameters.filter(param => param.in === 'formData').length;

  let res;

  res = ensureRule(() => {
    if (inBody) {
      inFormData.should.equal(0);
    }

    if (inFormData) {
      inBody.should.equal(0);
    }
  }, meta);

  if (res) results.push(res);

  return results;
};
