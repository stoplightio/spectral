// import { IRuleResult } from '../../types';

// import * as AJV from 'ajv';

// const jsonSpecv4 = require('ajv/lib/refs/json-schema-draft-04.json');

// const OASv2Schema: object = require('./schemas/openapi_v2.json');
// const OASv3Schema: object = require('./schemas/openapi_v3.json');

// export class Validator {
//   private ajv: AJV.Ajv;

//   constructor() {
//     this.ajv = new AJV({
//       meta: false,
//       schemaId: 'auto',
//       jsonPointers: true,
//     });
//     this.ajv.addMetaSchema(jsonSpecv4);
//     // this.ajv._opts.defaultMeta = jsonSpecv4.id;
//     // this.ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';
//     this.ajv.addSchema(OASv2Schema, 'oas2');
//     this.ajv.addSchema(OASv3Schema, 'oas3');
//   }

//   public validate = (o: object, format: string): IRuleResult[] => {
//     const results: IRuleResult[] = [];

//     if (!this.ajv.validate(format, o) && this.ajv.errors) {
//       results.push(...transformErrors(this.ajv.errors));
//     }

//     return results;
//   };
// }

// function transformErrors(errors: AJV.ErrorObject[]): IRuleResult[] {
//   const transformed: IRuleResult[] = [];

//   errors.forEach(e => {
//     if (e.params && e.params.additionalProperty) {
//       e.message = e.message + ': ' + e.params.additionalProperty;
//     }

//     transformed.push({
//       category: 'validation',
//       path: e.dataPath.split('/').slice(1),
//       name: e.keyword,
//       severity: 'error',
//       message: e.message || '',
//     });
//   });

//   return transformed;
// }
