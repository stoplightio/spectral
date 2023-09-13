import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { isObject } from './utils/isObject';

type Input = {
  discriminator: string;
  [key: string]: unknown;
};

export default createRulesetFunction<Input, null>(
  {
    input: {
      type: 'object',
      properties: {
        discriminator: {
          type: 'string',
        },
      },
      required: ['discriminator'],
    },
    options: null,
  },
  function oasDiscriminator(schema, _opts, { path }) {
    /**
     * This function verifies:
     *
     * 1. The discriminator property name is defined at this schema.
     * 2. The discriminator property is in the required property list.
     */

    const discriminatorName = schema.discriminator;

    const results: IFunctionResult[] = [];

    if (!isObject(schema.properties) || !Object.keys(schema.properties).some(k => k === discriminatorName)) {
      results.push({
        message: `The discriminator property must be defined in this schema.`,
        path: [...path, 'properties'],
      });
    }

    if (!Array.isArray(schema.required) || !schema.required.some(n => n === discriminatorName)) {
      results.push({
        message: `The discriminator property must be in the required property list.`,
        path: [...path, 'required'],
      });
    }

    return results;
  },
);
