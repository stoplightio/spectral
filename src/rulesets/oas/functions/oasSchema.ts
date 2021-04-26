import { ISchemaOptions } from '../../../functions/schema';
import { IFunction, IFunctionContext } from '../../../types';
import { translateSchemaObject } from '@stoplight/http-spec/oas/transformers/schema';

const oasSchema: IFunction<ISchemaOptions> = function (this: IFunctionContext, targetVal, opts, paths, otherValues) {
  const schema = translateSchemaObject(Object(otherValues.documentInventory.document.data), opts.schema);
  return this.functions.schema.call(this, targetVal, { ...opts, schema }, paths, otherValues);
};

export default oasSchema;
