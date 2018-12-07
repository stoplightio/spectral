import { ensureRule } from '../../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleOpts, IRuleResult, Rule } from '../../../../types';
import { IFunctionPaths } from '../../../../types/spectral';

export const oasOpFormDataConsumeCheck: IRuleFunction<Rule> = (opts: IRuleOpts<Rule>, paths: IFunctionPaths) => {
  const results: IRuleResult[] = [];

  const { object } = opts;
  const operation: any = object;

  const parameters = operation.parameters;
  const consumes = operation.consumes || [];

  if (parameters && parameters.find((p: any) => p.in === 'formData')) {
    const res = ensureRule(() => {
      consumes.should.matchAny(/(application\/x-www-form-urlencoded|multipart\/form-data)/);
    }, paths.given);

    if (res) results.push(res);
  }

  return results;
};
