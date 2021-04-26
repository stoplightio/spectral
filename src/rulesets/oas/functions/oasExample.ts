import type { IFunction, IFunctionContext, IFunctionResult, JSONSchema } from '../../../types';
import type { ISchemaOptions } from '../../../functions/schema';
import { isObject } from './utils/isObject';
import type { Dictionary, JsonPath, Optional } from '@stoplight/types';
import oasSchema from './oasSchema';

interface IOasExampleOptions {
  oasVersion: 2 | 3;
  schemaField: string;
  type: 'media' | 'schema';
}

type MediaValidationItem = {
  field: string;
  multiple: boolean;
  keyed: boolean;
};

const MEDIA_VALIDATION_ITEMS: Dictionary<MediaValidationItem[], 2 | 3> = {
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
};

const SCHEMA_VALIDATION_ITEMS: Dictionary<string[], 2 | 3> = {
  2: ['example', 'x-example', 'default'],
  3: ['example', 'default'],
};

type ValidationItem = {
  value: unknown;
  path: JsonPath;
};

function* getMediaValidationItems(
  items: MediaValidationItem[],
  targetVal: Dictionary<unknown>,
  givenPath: JsonPath,
  oasVersion: 2 | 3,
): Iterable<ValidationItem> {
  for (const { field, keyed, multiple } of items) {
    if (!(field in targetVal)) {
      continue;
    }

    const value = targetVal[field];

    if (multiple) {
      if (!isObject(value)) continue;

      for (const exampleKey of Object.keys(value)) {
        const exampleValue = value[exampleKey];
        if (oasVersion === 3 && keyed && (!isObject(exampleValue) || 'externalValue' in exampleValue)) {
          // should be covered by oas3-examples-value-or-externalValue
          continue;
        }

        const targetPath = [...givenPath, field, exampleKey];

        if (keyed) {
          targetPath.push('value');
        }

        yield {
          value: keyed && isObject(exampleValue) ? exampleValue.value : exampleValue,
          path: targetPath,
        };
      }

      return;
    } else {
      return yield {
        value,
        path: [...givenPath, field],
      };
    }
  }
}

function* getSchemaValidationItems(
  fields: string[],
  targetVal: Dictionary<unknown>,
  givenPath: JsonPath,
): Iterable<ValidationItem> {
  for (const field of fields) {
    if (!(field in targetVal)) {
      continue;
    }

    yield {
      value: targetVal[field],
      path: [...givenPath, field],
    };
  }
}

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
  };

  let results: Optional<IFunctionResult[]> = void 0;

  const validationItems =
    opts.type === 'schema'
      ? getSchemaValidationItems(SCHEMA_VALIDATION_ITEMS[opts.oasVersion], targetVal, paths.given)
      : getMediaValidationItems(MEDIA_VALIDATION_ITEMS[opts.oasVersion], targetVal, paths.given, opts.oasVersion);

  for (const validationItem of validationItems) {
    const result = oasSchema.call(
      this,
      validationItem.value,
      schemaOpts,
      {
        given: paths.given,
        target: validationItem.path,
      },
      otherValues,
    );

    if (Array.isArray(result)) {
      if (results === void 0) results = [];
      results.push(...result);
    }
  }

  return results;
};

export default oasExample;
