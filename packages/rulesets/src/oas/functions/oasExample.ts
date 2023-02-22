import { isObject } from './utils/isObject';
import type { Dictionary, JsonPath, Optional } from '@stoplight/types';
import oasSchema, { Options as SchemaOptions } from './oasSchema';
import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { oas2 } from '@stoplight/spectral-formats';

export type Options = {
  oasVersion: 2 | 3;
  schemaField: string;
  type: 'media' | 'schema';
};

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
  targetVal: Record<string, unknown>,
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

/**
 * Modifies 'schema' (and all its sub-schemas) to remove all "example" fields.
 * In this context, "sub-schemas" refers to all schemas reachable from 'schema'
 * (e.g. properties, additionalProperties, allOf/anyOf/oneOf, not, items, etc.)
 * @param schema the schema to be "de-examplified"
 * @returns 'schema' with example fields removed
 */
function deExamplify(schema: Record<string, unknown>): Record<string, unknown> {
  if ('items' in schema && typeof schema.items === 'object') {
    schema.items = deExamplify(schema.items as Record<string, unknown>);
  }

  if (Array.isArray(schema.allOf)) {
    for (let i = 0; i < schema.allOf.length; i++) {
      schema.allOf[i] = deExamplify(schema.allOf[i] as Record<string, unknown>);
    }
  }
  if (Array.isArray(schema.anyOf)) {
    for (let i = 0; i < schema.anyOf.length; i++) {
      schema.anyOf[i] = deExamplify(schema.anyOf[i] as Record<string, unknown>);
    }
  }
  if (Array.isArray(schema.oneOf)) {
    for (let i = 0; i < schema.oneOf.length; i++) {
      schema.oneOf[i] = deExamplify(schema.oneOf[i] as Record<string, unknown>);
    }
  }
  if ('not' in schema && typeof schema.not === 'object') {
    schema.not = deExamplify(schema.not as Record<string, unknown>);
  }

  if ('additionalProperties' in schema && typeof schema.additionalProperties === 'object') {
    schema.additionalProperties = deExamplify(schema.additionalProperties as Record<string, unknown>);
  }

  if ('properties' in schema && typeof schema.properties === 'object') {
    for (const propName in schema.properties) {
      schema.properties[propName] = deExamplify(schema.properties[propName] as Record<string, unknown>);
    }
  }

  if ('example' in schema) {
    delete schema.example;
  }

  return schema;
}

export default createRulesetFunction<Record<string, unknown>, Options>(
  {
    input: {
      type: 'object',
    },
    options: {
      type: 'object',
      properties: {
        oasVersion: {
          enum: [2, 3],
        },
        schemaField: {
          type: 'string',
        },
        type: {
          enum: ['media', 'schema'],
        },
      },
      additionalProperties: false,
    },
  },
  function oasExample(targetVal, opts, context) {
    const formats = context.document.formats;
    const schemaOpts: SchemaOptions = {
      schema: opts.schemaField === '$' ? targetVal : (targetVal[opts.schemaField] as SchemaOptions['schema']),
    };

    let results: Optional<IFunctionResult[]> = void 0;

    const validationItems =
      opts.type === 'schema'
        ? getSchemaValidationItems(SCHEMA_VALIDATION_ITEMS[opts.oasVersion], targetVal, context.path)
        : getMediaValidationItems(MEDIA_VALIDATION_ITEMS[opts.oasVersion], targetVal, context.path, opts.oasVersion);

    if (formats?.has(oas2) && 'required' in schemaOpts.schema && typeof schemaOpts.schema.required === 'boolean') {
      schemaOpts.schema = { ...schemaOpts.schema };
      delete schemaOpts.schema.required;
    }

    // Make a deep copy of the schema and then remove all the "example" fields from it.
    // This is to avoid problems down in "ajv" which does the actual schema validation.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    schemaOpts.schema = JSON.parse(JSON.stringify(schemaOpts.schema));
    schemaOpts.schema = deExamplify(schemaOpts.schema);

    for (const validationItem of validationItems) {
      const result = oasSchema(validationItem.value, schemaOpts, {
        ...context,
        path: validationItem.path,
      });

      if (Array.isArray(result)) {
        if (results === void 0) results = [];
        results.push(...result);
      }
    }

    return results;
  },
);
