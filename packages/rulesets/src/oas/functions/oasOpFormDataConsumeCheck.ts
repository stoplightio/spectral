import type { IFunction } from '@stoplight/spectral-core';
import { isObject } from './utils/isObject';

const validConsumeValue = /(application\/x-www-form-urlencoded|multipart\/form-data)/;

export const oasOpFormDataConsumeCheck: IFunction = targetVal => {
  if (!isObject(targetVal)) return;

  const parameters: unknown = targetVal.parameters;
  const consumes: unknown = targetVal.consumes;

  if (!Array.isArray(parameters) || !Array.isArray(consumes)) {
    return;
  }

  if (parameters.some(p => isObject(p) && p.in === 'formData') && !validConsumeValue.test(consumes?.join(','))) {
    return [
      {
        message: 'Consumes must include urlencoded, multipart, or form-data media type when using formData parameter.',
      },
    ];
  }

  return;
};

export default oasOpFormDataConsumeCheck;
