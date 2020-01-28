import { IFunction, IFunctionResult, IRule, RuleFunction } from '../types';
import { schema } from './schema';

export type TypedEnumRule = IRule<RuleFunction.TYPED_ENUM>;

export const typedEnum: IFunction = (targetVal, opts, paths, otherValues): void | IFunctionResult[] => {
  const { enum: enumValues, ...initialSchema } = targetVal;

  if (!Array.isArray(enumValues)) {
    return;
  }

  const innerSchema = { type: initialSchema.type, enum: initialSchema.enum };
  const schemaObject = { schema: innerSchema };

  const incorrectValues: Array<{ index: number; val: unknown }> = [];

  enumValues.forEach((val, index) => {
    const res = schema(val, schemaObject, paths, otherValues);

    if (res !== undefined && res.length !== 0) {
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
