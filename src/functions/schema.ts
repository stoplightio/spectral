import { decodePointerFragment } from '@stoplight/json';
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

  const path = paths.target || paths.given;

  if (!targetVal)
    return [
      {
        path,
        message: `${paths ? path.join('.') : 'property'} does not exist`,
      },
    ];

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
        path: path.concat(
          e.dataPath
            .split('/')
            .slice(1)
            .map(frag => decodePointerFragment(frag))
        ),
        message: e.message ? e.message : '',
      });
    });
  }

  return results;
};
