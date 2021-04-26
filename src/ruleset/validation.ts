import AJV, { ErrorObject } from 'ajv';
import { isObject } from 'lodash';
import addFormats from 'ajv-formats';

import { FileRule, IRulesetFile } from '../types/ruleset';
import * as ruleSchema from '../meta/rule.schema.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';
import * as shared from '../meta/shared.json';
import { IFunction, IFunctionPaths, IFunctionValues, IRule, JSONSchema } from '../types';

const ajv = new AJV({ allErrors: true, allowUnionTypes: true, strict: true, strictRequired: false });
addFormats(ajv);
const validate = ajv.addSchema(ruleSchema).addSchema(shared).compile(rulesetSchema);

const serializeAJVErrors = (errors: ErrorObject[]): string =>
  errors.map(({ message, instancePath }) => `${instancePath} ${message}`).join('\n');

export class ValidationError extends AJV.ValidationError {
  public message: string;

  constructor(public errors: ErrorObject[]) {
    super(errors);
    this.message = serializeAJVErrors(errors);
  }
}

export function assertValidRuleset(ruleset: unknown): IRulesetFile {
  if (!isObject(ruleset)) {
    throw new Error('Provided ruleset is not an object');
  }

  if (!('rules' in ruleset) && !('extends' in ruleset)) {
    throw new Error('Ruleset must have rules or extends property');
  }

  if (!validate(ruleset)) {
    throw new ValidationError(validate.errors ?? []);
  }

  return ruleset as IRulesetFile;
}

export function isValidRule(rule: FileRule): rule is IRule {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}

export function decorateIFunctionWithSchemaValidation(fn: IFunction<any>, schema: JSONSchema) {
  return (data: unknown, opts: unknown, ...args: [IFunctionPaths, IFunctionValues]) => {
    if (!ajv.validate(schema, opts)) {
      throw new ValidationError(ajv.errors ?? []);
    }

    return fn(data, opts, ...args);
  };
}
