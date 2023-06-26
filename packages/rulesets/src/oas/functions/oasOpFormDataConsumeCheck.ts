import { createRulesetFunction } from '@stoplight/spectral-core';
import { isObject } from './utils/isObject';

const validConsumeValue = /(application\/x-www-form-urlencoded|multipart\/form-data)/;

type Input = {
  consumes: unknown[];
  parameters: unknown[];
};

export default createRulesetFunction<Input, null>(
  {
    input: {
      type: 'object',
      properties: {
        consumes: {
          type: 'array',
        },
        parameters: {
          type: 'array',
        },
      },
      required: ['consumes', 'parameters'],
    },
    options: null,
  },
  function oasOpFormDataConsumeCheck({ parameters, consumes }) {
    if (parameters.some(p => isObject(p) && p.in === 'formData') && !validConsumeValue.test(consumes?.join(','))) {
      return [
        {
          message:
            'Consumes must include urlencoded, multipart, or form-data media type when using formData parameter.',
        },
      ];
    }

    return;
  },
);
