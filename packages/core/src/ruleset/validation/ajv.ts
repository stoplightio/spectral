import Ajv, { _, ValidateFunction } from 'ajv';
import names from 'ajv/dist/compile/names';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import * as ruleSchema from '../meta/rule.schema.json';
import * as shared from '../meta/shared.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';
import * as jsExtensions from '../meta/js-extensions.json';
import * as jsonExtensions from '../meta/json-extensions.json';
import { validateAlias } from './validators/alias';
import { validateFunction } from './validators/function';

const validators: { [key in 'js' | 'json']: null | ValidateFunction } = {
  js: null,
  json: null,
};

export function createValidator(format: 'js' | 'json'): ValidateFunction {
  const existingValidator = validators[format];
  if (existingValidator !== null) {
    return existingValidator;
  }

  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    strictRequired: false,
    keywords: ['$anchor'],
    schemas: [ruleSchema, shared],
    passContext: true,
  });
  addFormats(ajv);
  addErrors(ajv);
  ajv.addKeyword({
    keyword: 'x-spectral-runtime',
    schemaType: 'string',
    error: {
      message(cxt) {
        return _`${cxt.params?.message !== void 0 ? cxt.params.message : ''}`;
      },
      params(cxt) {
        return _`{ errors: ${cxt.params?.errors !== void 0 && cxt.params.errors} || [] }`;
      },
    },
    code(cxt) {
      const { data } = cxt;

      switch (cxt.schema as unknown) {
        case 'format':
          cxt.fail(_`typeof ${data} !== "function"`);
          break;
        case 'ruleset-function': {
          const fn = cxt.gen.const(
            'spectralFunction',
            _`this.validateFunction(${data}.function, ${data}.functionOptions === void 0 ? null : ${data}.functionOptions, ${names.instancePath})`,
          );
          cxt.gen.if(_`${fn} !== void 0`);
          cxt.error(false, { errors: fn });
          cxt.gen.endIf();
          break;
        }
        case 'alias': {
          const alias = cxt.gen.const(
            'spectralAlias',
            _`this.validateAlias(${names.rootData}, ${data}, ${names.instancePath})`,
          );
          cxt.gen.if(_`${alias} !== void 0`);
          cxt.error(false, { errors: alias });
          cxt.gen.endIf();
          break;
        }
      }
    },
  });

  if (format === 'js') {
    ajv.addSchema(jsExtensions);
  } else {
    ajv.addSchema(jsonExtensions);
  }

  const validator = new Proxy(ajv.compile(rulesetSchema), {
    apply(target, thisArg, args: unknown[]): unknown {
      return Reflect.apply(target, { validateAlias, validateFunction }, args);
    },
  });

  validators[format] = validator;
  return validator;
}
