import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleResult, Rule } from '../../../../types';

export const oasOpNoBodyFormData: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const parameters: any[] = _object;

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
  }, ruleMeta);

  if (res) results.push(res);

  return results;
};
