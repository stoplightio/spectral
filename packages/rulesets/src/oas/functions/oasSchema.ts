import * as traverse from 'json-schema-traverse';
import type { SchemaObject } from 'json-schema-traverse';
import { isObject } from './utils/isObject';
import { schema as schemaFn, SchemaOptions } from '@stoplight/spectral-functions';
import { createRulesetFunction } from '@stoplight/spectral-core';
import { oas2, oas3_0, oas3_1, extractDraftVersion } from '@stoplight/spectral-formats';
import { isPlainObject } from '@stoplight/json';

export type Options = {
  schema: Record<string, unknown>;
};

export default createRulesetFunction<unknown, Options>(
  {
    input: null,
    options: {
      type: 'object',
      properties: {
        schema: {
          type: 'object',
        },
      },
      additionalProperties: false,
    },
  },
  function oasSchema(targetVal, opts, context) {
    const formats = context.document.formats;

    let { schema } = opts;

    let dialect: SchemaOptions['dialect'] = 'draft4';

    if (formats) {
      try {
        if (formats.has(oas2)) {
          schema = convertXNullable({ ...schema });
          traverse(schema, visitOAS2);
        } else if (formats.has(oas3_0)) {
          schema = convertNullable({ ...schema });
          traverse(schema, visitOAS3);
        } else if (formats.has(oas3_1)) {
          if (isPlainObject(context.document.data) && typeof context.document.data.jsonSchemaDialect === 'string') {
            dialect =
              (extractDraftVersion(context.document.data.jsonSchemaDialect) as SchemaOptions['dialect']) ??
              'draft2020-12';
          } else {
            dialect = 'draft2020-12';
          }
        }
      } catch {
        // just in case
      }
    }

    return schemaFn(targetVal, { ...opts, schema, dialect }, context);
  },
);

const visitOAS2: traverse.Callback = (
  schema,
  jsonPtr,
  rootSchema,
  parentJsonPtr,
  parentKeyword,
  parentSchema,
  keyIndex,
) => {
  if (parentSchema !== void 0 && keyIndex !== void 0 && jsonPtr !== void 0) {
    const actualSchema = get(parentSchema, jsonPtr);
    if (actualSchema !== null) {
      actualSchema[keyIndex] = convertXNullable({ ...schema });
    }
  }
};

const visitOAS3: traverse.Callback = (
  schema,
  jsonPtr,
  rootSchema,
  parentJsonPtr,
  parentKeyword,
  parentSchema,
  keyIndex,
) => {
  if (parentSchema !== void 0 && keyIndex !== void 0 && jsonPtr !== void 0) {
    const actualSchema = get(parentSchema, jsonPtr);
    if (actualSchema !== null) {
      actualSchema[keyIndex] = convertNullable({ ...schema });
    }
  }
};

function get(obj: SchemaObject, jsonPtr: string): SchemaObject | null {
  const path = jsonPtr.slice(1).split('/');
  if (path.length === 1) {
    return obj;
  }

  path.pop();

  let curObj: SchemaObject = obj;
  for (const segment of path) {
    const value: unknown = curObj[segment];
    if (!isObject(value)) {
      throw ReferenceError(`${segment} not found`);
    }

    const newValue = Array.isArray(value) ? value.slice() : { ...value };
    curObj[segment] = newValue;
    curObj = newValue;
  }

  return curObj;
}

const createNullableConverter = (keyword: 'x-nullable' | 'nullable') => {
  return (schema: SchemaObject): SchemaObject => {
    if (!(keyword in schema)) return schema;
    if (schema[keyword] === true) {
      schema.type = [schema.type, 'null'];

      if (Array.isArray(schema.enum)) {
        schema.enum = [...(schema.enum as unknown[]), null];
      }
    }

    delete schema[keyword];
    return schema;
  };
};

const convertXNullable = createNullableConverter('x-nullable');
const convertNullable = createNullableConverter('nullable');
