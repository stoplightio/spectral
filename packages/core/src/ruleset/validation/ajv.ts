import Ajv, { _, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import * as ruleSchema from '../meta/rule.schema.json';
import * as shared from '../meta/shared.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';
import * as jsExtensions from '../meta/js-extensions.json';
import * as jsonExtensions from '../meta/json-extensions.json';

const message = _`'spectral-message'`;

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
  });
  addFormats(ajv);
  addErrors(ajv);
  ajv.addKeyword({
    keyword: 'x-spectral-runtime',
    schemaType: 'string',
    error: {
      message(cxt) {
        return _`${cxt.data}[Symbol.for(${message})]`;
      },
      params(cxt) {
        return _`${cxt.data}[Symbol.for(${message})] ? { "errors": ${cxt.data}[Symbol.for(${message})].errors || [${cxt.data}[Symbol.for(${message})]] } : {}`;
      },
    },
    code(cxt) {
      const { data } = cxt;

      switch (cxt.schema as unknown) {
        case 'format':
          cxt.fail(_`typeof ${data} !== "function"`);
          break;
        case 'ruleset-function':
          cxt.pass(_`typeof ${data}.function === "function"`);
          cxt.pass(
            _`(() => { try { ${data}.function.validator && ${data}.function.validator('functionOptions' in ${data} ? ${data}.functionOptions : null); return true; } catch (e) { ${data}[Symbol.for(${message})] = e; return false; } })()`,
          );
          break;
      }
    },
  });

  if (format === 'js') {
    ajv.addSchema(jsExtensions);
  } else {
    ajv.addSchema(jsonExtensions);
  }

  const validator = ajv.compile(rulesetSchema);
  validators[format] = validator;
  return validator;
}
