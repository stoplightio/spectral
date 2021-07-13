import { schema } from '@stoplight/spectral-functions';
import { oas2, oas3 } from '@stoplight/spectral-formats';
import type { IFunction } from '@stoplight/spectral-core';
import { isObject } from './utils/isObject';

export const typedEnum: IFunction = function (targetVal, opts, context) {
  if (!isObject(targetVal)) {
    return;
  }

  if (targetVal.enum === null || targetVal.enum === void 0 || targetVal.type === null || targetVal.type === void 0) {
    return;
  }
  // do not use rest spread operator here, as this causes the whole tslib gets injected despite proper target set...
  // obviously, having tslib inlined makes the code size quite larger (around 4x after compression - 1.8K vs 7.4K).
  const { enum: enumValues } = targetVal;
  const initialSchema = Object.assign({}, targetVal);
  delete initialSchema.enum;

  if (!Array.isArray(enumValues)) {
    return;
  }

  const { document } = context;
  const isOAS3 = document.formats?.has(oas3) === true;
  const isOAS2 = document.formats?.has(oas2) === true;

  let innerSchema;
  if ((isOAS3 && targetVal.nullable === true) || (isOAS2 && targetVal['x-nullable'] === true)) {
    const type = Array.isArray(initialSchema.type)
      ? [...(initialSchema.type as unknown[])]
      : initialSchema.type !== void 0
      ? [initialSchema.type]
      : [];
    if (!type.includes('null')) {
      type.push('null');
    }

    innerSchema = { type, enum: initialSchema.enum };
  } else {
    innerSchema = { type: initialSchema.type, enum: initialSchema.enum };
  }

  const schemaObject = { schema: innerSchema };

  const incorrectValues: Array<{ index: number; val: unknown }> = [];

  (enumValues as unknown[]).forEach((val, index) => {
    const res = schema(val, schemaObject, context);

    if (Array.isArray(res) && res.length !== 0) {
      incorrectValues.push({ index, val });
    }
  });

  if (incorrectValues.length === 0) {
    return;
  }

  const { type } = initialSchema;

  return incorrectValues.map(bad => {
    return {
      message: `Enum value \`${String(bad.val)}\` must be "${String(type)}".`,
      path: [...context.path, 'enum', bad.index],
    };
  });
};

export default typedEnum;
