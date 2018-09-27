import { ISchemaRule, RawResult } from '../../types';

import * as AJV from 'ajv';

const jsonSpecv4 = require('ajv/lib/refs/json-schema-draft-04.json');

const OASv2Schema: object = require('./schemas/openapi_v2.json');
const OASv3Schema: object = require('./schemas/openapi_v3.json');

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
ajv.addSchema(OASv2Schema, 'oas2');
ajv.addSchema(OASv3Schema, 'oas3');

export const schema = (r: ISchemaRule): ((object: any) => RawResult[]) => {
  return (object: object): RawResult[] => {
    if (typeof r.schema === 'string') {
      if (!ajv.validate(r.schema, object) && ajv.errors) {
        return ajv.errors;
      }
    }
    return [];
  };
};
