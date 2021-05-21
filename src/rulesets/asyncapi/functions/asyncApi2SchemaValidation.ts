import type { IFunctionContext, IFunction, IFunctionResult } from '../../../spectral';
import { isObject } from './utils/isObject';
import type { JsonPath } from '@stoplight/types';

function getRelevantItems(
  target: Record<string, unknown>,
  type: 'default' | 'examples',
): { path: JsonPath; value: unknown }[] {
  if (type === 'default') {
    return [{ path: ['default'], value: target.default }];
  }

  if (!isObject(target.examples)) {
    throw new Error('');
  }

  return Object.entries(target.examples).map(([key, value]) => ({
    path: ['examples', key],
    value,
  }));
}

const asyncApi2SchemaValidation: IFunction<{ type: 'default' | 'examples' }> = function (
  this: IFunctionContext,
  targetVal,
  opts,
  paths,
  otherValues,
) {
  if (!isObject(targetVal)) return;

  const schemaObject = targetVal;
  const relevantItems = getRelevantItems(targetVal, opts.type);

  const results: IFunctionResult[] = [];

  for (const relevantItem of relevantItems) {
    const result = this.functions.schema.call(
      this,
      relevantItem.value,
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        schema: schemaObject,
        allErrors: true,
      },
      {
        given: paths.given,
        target: [...(paths.target ?? paths.given), ...relevantItem.path],
      },
      otherValues,
    );

    if (Array.isArray(result)) {
      results.push(...result);
    }
  }

  return results;
};

export { asyncApi2SchemaValidation as default };
