import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleResult, Rule } from '../../../../types';

export const oasOpFormDataConsumeCheck: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const operation: any = _object;

  const parameters = operation.parameters;
  const consumes = operation.consumes || [];

  if (parameters && parameters.find((p: any) => p.in === 'formData')) {
    const res = ensureRule(() => {
      consumes.should.matchAny(/(application\/x-www-form-urlencoded|multipart\/form-data)/);
    }, ruleMeta);

    if (res) results.push(res);
  }

  return results;
};
