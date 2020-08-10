import type { IFunction, IFunctionContext, IFunctionResult } from '../../../types';
import type { Dictionary } from '@stoplight/types';
import type { ISchemaOptions } from '../../../functions/schema';

function isObject(value: unknown): value is Dictionary<any> {
  return value !== null && typeof value === 'object';
}

interface IOasExampleOptions {
  oasVersion: 2 | 3;
  schemaField: string;
  type: 'media' | 'schema';
}

const ORDER_CHECK = {
  media: {
    2: [
      {
        field: 'examples',
        multiple: true,
      },
    ],
    3: [
      {
        field: 'example',
        multiple: false,
      },
      {
        field: 'examples',
        multiple: true,
      },
    ],
  },
  schema: {
    2: [
      {
        field: 'example',
        multiple: false,
      },
      {
        field: 'x-example',
        multiple: false,
      },
    ],
    3: [
      {
        field: 'example',
        multiple: false,
      },
    ],
  },
};

export const oasExample: IFunction<IOasExampleOptions> = function (
  this: IFunctionContext,
  targetVal,
  opts,
  paths,
  otherValues,
) {
  if (!isObject(targetVal)) {
    return;
  }

  const schemaOpts: ISchemaOptions = {
    schema: opts.schemaField === '$' ? targetVal : targetVal[opts.schemaField],
    oasVersion: opts.oasVersion,
  };

  const order = ORDER_CHECK[opts.type][opts.oasVersion];

  for (const { field, multiple } of order) {
    if (!(field in targetVal)) {
      continue;
    }

    const value = targetVal[field];

    if (multiple) {
      if (!isObject(value)) {
        continue;
      }

      const results: IFunctionResult[] = [];

      for (const exampleKey of Object.keys(value)) {
        const exampleValue = value[exampleKey];
        if (!isObject(exampleValue)) {
          // should be covered by oas3-examples-value-or-externalValue
          continue;
        }

        const result = this.functions.schema.call(
          this,
          exampleValue.value,
          schemaOpts,
          {
            given: paths.given,
            target: [...paths.given, field, exampleKey, 'value'],
          },
          otherValues,
        );

        if (Array.isArray(result)) {
          results.push(...result);
        }
      }

      return results;
    } else {
      return this.functions.schema.call(
        this,
        value,
        schemaOpts,
        {
          given: paths.given,
          target: [...paths.given, field],
        },
        otherValues,
      );
    }
  }

  return;
};

export default oasExample;
