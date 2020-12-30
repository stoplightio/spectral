import type { IFunction, IFunctionContext, IFunctionResult, JSONSchema } from '../../../types';
import type { ISchemaOptions } from '../../../functions/schema';
import { isObject } from './utils/isObject';

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
        keyed: false,
      },
    ],
    3: [
      {
        field: 'example',
        multiple: false,
        keyed: false,
      },
      {
        field: 'examples',
        multiple: true,
        keyed: true,
      },
    ],
  },
  schema: {
    2: [
      {
        field: 'example',
        multiple: false,
        keyed: false,
      },
      {
        field: 'x-example',
        multiple: false,
        keyed: false,
      },
    ],
    3: [
      {
        field: 'example',
        multiple: false,
        keyed: false,
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
    schema: opts.schemaField === '$' ? targetVal : (targetVal[opts.schemaField] as JSONSchema),
    oasVersion: opts.oasVersion,
  };

  const order = ORDER_CHECK[opts.type][opts.oasVersion];

  for (const { field, keyed, multiple } of order) {
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
        if (opts.oasVersion === 3 && keyed && (!isObject(exampleValue) || 'externalValue' in exampleValue)) {
          // should be covered by oas3-examples-value-or-externalValue
          continue;
        }

        const targetPath = [...paths.given, field, exampleKey];

        if (keyed) {
          targetPath.push('value');
        }

        const result = this.functions.schema.call(
          this,
          keyed && isObject(exampleValue) ? exampleValue.value : exampleValue,
          schemaOpts,
          {
            given: paths.given,
            target: targetPath,
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
