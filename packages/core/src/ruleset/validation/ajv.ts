import Ajv, { _, ValidateFunction } from 'ajv';
import names from 'ajv/dist/compile/names';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import { isError, get } from 'lodash';
import * as ruleSchema from '../meta/rule.schema.json';
import * as shared from '../meta/shared.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';
import * as jsExtensions from '../meta/js-extensions.json';
import * as jsonExtensions from '../meta/json-extensions.json';
import { resolveAlias } from '../alias';
import type { RulesetFunction, RulesetFunctionWithValidator } from '../../types';
import { Formats } from '../formats';

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
    keyword: 'spectral-runtime',
    schemaType: 'string',
    error: {
      message(cxt) {
        return _`${cxt.params?.message ? cxt.params.message : ''}`;
      },
    },
    code(cxt) {
      const { data } = cxt;

      switch (cxt.schema as unknown) {
        case 'format':
          cxt.fail(_`typeof ${data} !== "function"`);
          break;
        case 'ruleset-function': {
          cxt.gen.if(_`typeof ${data}.function !== "function"`);
          cxt.error(false, { message: 'function is not defined' });
          cxt.gen.endIf();
          const fn = cxt.gen.const(
            'spectralFunction',
            _`this.validateFunction(${data}.function, ${data}.functionOptions)`,
          );
          cxt.gen.if(_`${fn} !== void 0`);
          cxt.error(false, { message: fn });
          cxt.gen.endIf();
          break;
        }
        case 'alias': {
          const alias = cxt.gen.const(
            'spectralAlias',
            _`this.validateAlias(${names.rootData}, ${data}, ${names.instancePath})`,
          );
          cxt.gen.if(_`${alias} !== void 0`);
          cxt.error(false, { message: alias });
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

  const validator = ajv.compile(rulesetSchema);
  validators[format] = new Proxy(validator, {
    apply(target, thisArg, args: unknown[]): unknown {
      return Reflect.apply(target, { validateAlias, validateFunction }, args);
    },
  });
  return validator;
}

export function validateAlias(
  ruleset: { aliases?: Record<string, unknown>; overrides?: Record<string, unknown> },
  alias: string,
  path: string,
): string | void {
  try {
    const parsedPath = path.slice(1).split('/');
    // skip overrides for now
    if (parsedPath[0] === 'overrides') return;

    const formats: unknown = get(ruleset, [...parsedPath.slice(0, parsedPath.indexOf('rules') + 2), 'formats']);
    resolveAlias(ruleset.aliases ?? null, alias, Array.isArray(formats) ? new Formats(formats) : null);
  } catch (ex) {
    return isError(ex) ? ex.message : 'invalid alias';
  }
}

export function validateFunction(fn: RulesetFunction | RulesetFunctionWithValidator, opts: unknown): string | void {
  if (!('validator' in fn)) return;

  try {
    const validator: RulesetFunctionWithValidator['validator'] = fn.validator.bind(fn);
    validator(opts);
  } catch (ex) {
    return isError(ex) ? ex.message : 'invalid options';
  }
}
