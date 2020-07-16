import type { IFunction, IFunctionContext, IFunctionResult } from '../../../types';
import type { Optional, Dictionary } from '@stoplight/types';
import type { ISchemaOptions } from '../../../functions/schema';

function isObject(value: unknown): value is Dictionary<any> {
  // todo: expose a util, so it can be used everywhere
  return value !== null && typeof value === 'object';
}

interface IOasExampleOptions {
  oasVersion: Optional<2 | 3 | 3.1>;
  schemaField: string;
}

export const oasExample: IFunction<IOasExampleOptions> = function (
  this: IFunctionContext,
  targetVal,
  opts,
  paths,
  otherValues,
) {
  // todo: validate options?
  if (!isObject(targetVal)) {
    return;
  }

  const { example, examples } = targetVal;
  const schemaOpts: ISchemaOptions = {
    schema: opts.schemaField === '$' ? targetVal : targetVal[opts.schemaField],
    oasVersion: opts.oasVersion,
  };

  if (example !== void 0) {
    return this.functions.schema.call(
      this,
      example,
      schemaOpts,
      {
        given: paths.given,
        target: [...paths.given, 'example'],
      },
      otherValues,
    );
  }

  if (examples !== void 0 && isObject(examples)) {
    const results: IFunctionResult[] = [];

    for (const exampleKey of Object.keys(examples)) {
      const exampleValue = examples[exampleKey];
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
          target: [...paths.given, 'examples', exampleKey, 'value'],
        },
        otherValues,
      );

      if (Array.isArray(result)) {
        results.push(...result);
      }
    }

    return results;
  }

  return;
};

export default oasExample;
