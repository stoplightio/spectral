import { IFunction, IFunctionResult } from '../../../types';

export const oasOpFormDataConsumeCheck: IFunction = targetVal => {
  const results: IFunctionResult[] = [];

  const parameters = targetVal.parameters;
  const consumes = targetVal.consumes || [];

  if (parameters && parameters.find((p: any) => p.in === 'formData')) {
    if (!consumes.join(',').match(/(application\/x-www-form-urlencoded|multipart\/form-data)/)) {
      results.push({
        message: 'consumes must include urlencoded, multipart, or formdata media type when using formData parameter',
      });
    }
  }

  return results;
};

export default oasOpFormDataConsumeCheck;
