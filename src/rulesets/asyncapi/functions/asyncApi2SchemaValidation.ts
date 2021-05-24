import type { IFunctionContext, IFunction, IFunctionResult } from '../../../spectral';
import type { JsonPath } from '@stoplight/types';

type SchemaFragment = {
  default?: unknown;
  examples?: unknown[];
};

function getRelevantItems(target: SchemaFragment, type: 'default' | 'examples'): { path: JsonPath; value: unknown }[] {
  if (type === 'default') {
    return [{ path: ['default'], value: target.default }];
  }

  if (!Array.isArray(target.examples)) {
    return [];
  }

  return Array.from<[number, unknown]>(target.examples.entries()).map(([key, value]) => ({
    path: ['examples', key],
    value,
  }));
}

function isSchemaFragment(maybeSchemaFragment: unknown): maybeSchemaFragment is SchemaFragment {
  if (typeof maybeSchemaFragment !== 'object' || maybeSchemaFragment === null || Array.isArray(maybeSchemaFragment)) {
    return false;
  }

  const schemaFragment = maybeSchemaFragment as Record<string, unknown>;
  return 'default' in schemaFragment || ('examples' in schemaFragment && Array.isArray(schemaFragment.examples));
}

const asyncApi2SchemaValidation: IFunction<{ type: 'default' | 'examples' }> = function (
  this: IFunctionContext,
  targetVal,
  opts,
  paths,
  otherValues,
) {
  if (!isSchemaFragment(targetVal)) {
    return [
      {
        message: `#{{print("property")}must be an object containing "default" or an "examples" array`,
      },
    ];
  }

  const schemaObject = targetVal;
  const relevantItems = getRelevantItems(targetVal, opts.type);

  const results: IFunctionResult[] = [];

  for (const relevantItem of relevantItems) {
    const result = this.functions.schema.call(
      this,
      relevantItem.value,
      {
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
