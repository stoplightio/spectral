import { IFunction, IFunctionContext } from '../../../types';

export const typedEnum: IFunction = function (this: IFunctionContext, targetVal, opts, paths, otherValues) {
  if (targetVal === null || typeof targetVal !== 'object') return;
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

  const innerSchema = { type: initialSchema.type, enum: initialSchema.enum };
  const schemaObject = { schema: innerSchema };

  const incorrectValues: Array<{ index: number; val: unknown }> = [];

  enumValues.forEach((val, index) => {
    const res = this.functions.schema(val, schemaObject, paths, otherValues);

    if (Array.isArray(res) && res.length !== 0) {
      incorrectValues.push({ index, val });
    }
  });

  if (incorrectValues.length === 0) {
    return;
  }

  const { type } = initialSchema;

  const rootPath = paths.target ?? paths.given;

  return incorrectValues.map(bad => {
    return {
      message: `Enum value \`${bad.val}\` does not respect the specified type \`${type}\`.`,
      path: [...rootPath, 'enum', bad.index],
    };
  });
};

export default typedEnum;
