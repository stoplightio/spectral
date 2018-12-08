import * as AJV from 'ajv';
import * as jsonSpecv4 from 'ajv/lib/refs/json-schema-draft-04.json';

const ajv = new AJV({
  meta: false,
  schemaId: 'auto',
  jsonPointers: true,
});
ajv.addMetaSchema(jsonSpecv4);
// @ts-ignore
ajv._opts.defaultMeta = jsonSpecv4.id;
// @ts-ignore
ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';

import { IFunction, IFunctionResult, ISchemaOptions } from '../types';

export const schema: IFunction<ISchemaOptions> = (targetVal, opts, paths) => {
  const results: IFunctionResult[] = [];

  if (!targetVal) return results;

  const { schema: schemaObj } = opts;

  // TODO: potential performance improvements (compile, etc)?
  if (!ajv.validate(schemaObj, targetVal) && ajv.errors) {
    ajv.errors.forEach((e: AJV.ErrorObject) => {
      // @ts-ignore
      if (e.params && e.params.additionalProperty) {
        // @ts-ignore
        e.message = e.message + ': ' + e.params.additionalProperty;
      }

      results.push({
        path: paths.given.concat(e.dataPath.split('/').slice(1)),
        message: e.message ? e.message : '',
      });
    });
  }

  return results;
};
