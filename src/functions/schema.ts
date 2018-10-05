import * as AJV from 'ajv';
import * as jsonSpecv4 from 'ajv/lib/refs/json-schema-draft-04.json';

import { IRuleFunction, IRuleResult, ISchemaRule } from '../types';

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

export const schema: IRuleFunction<ISchemaRule> = (object, r, meta) => {
  const results: IRuleResult[] = [];

  const { schema: schemaObj } = r.input;

  // TODO: potential performance improvements (compile, etc)?
  if (!ajv.validate(schemaObj, object) && ajv.errors) {
    ajv.errors.forEach((e: AJV.ErrorObject) => {
      // @ts-ignore
      if (e.params && e.params.additionalProperty) {
        // @ts-ignore
        e.message = e.message + ': ' + e.params.additionalProperty;
      }

      results.push({
        type: meta.rule.type,
        path: e.dataPath.split('/').slice(1), // FIXME - do we need to merge paths with meta path?
        name: meta.name,
        summary: r.summary,
        severity: r.severity ? r.severity : 'error',
        message: e.message ? e.message : '',
      });
    });
  }

  return results;
};
