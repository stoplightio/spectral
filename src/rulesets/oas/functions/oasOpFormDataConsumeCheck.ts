import type { IFunction } from '../../../types';

const validConsumeValue = /(application\/x-www-form-urlencoded|multipart\/form-data)/;

export const oasOpFormDataConsumeCheck: IFunction = targetVal => {
  const parameters: unknown = targetVal.parameters;
  const consumes: unknown = targetVal.consumes;

  if (!Array.isArray(parameters) || !Array.isArray(consumes)) {
    return;
  }

  if (parameters.some(p => p?.in === 'formData') && !validConsumeValue.test(consumes?.join(','))) {
    return [
      {
        message: 'Consumes must include urlencoded, multipart, or form-data media type when using formData parameter.',
      },
    ];
  }

  return;
};

export default oasOpFormDataConsumeCheck;
