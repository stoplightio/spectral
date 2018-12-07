import * as AJV from 'ajv';
import * as jsonSpecv4 from 'ajv/lib/refs/json-schema-draft-04.json';
import { IRuleFunction, IRuleOpts, IRuleResult, ISchemaRule } from '../types';
import { IFunctionPaths } from '../types/spectral';

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

export const schema: IRuleFunction<ISchemaRule> = (opts: IRuleOpts<ISchemaRule>, paths: IFunctionPaths) => {
  const results: IRuleResult[] = [];

  const { object, rule } = opts;
  const { schema: schemaObj } = rule.then.functionOptions;

  // TODO: potential performance improvements (compile, etc)?
  if (!ajv.validate(schemaObj, object) && ajv.errors) {
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
