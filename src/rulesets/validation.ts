import { FileRule, IRulesetFile } from '../types/ruleset';

import { ErrorObject } from 'ajv';
const AJV = require('ajv');
import { isObject } from 'lodash';
import * as ruleSchema from '../meta/rule.schema.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';
import { IFunction, IFunctionPaths, IFunctionValues, IRule, JSONSchema } from '../types';

const ajv = new AJV({ allErrors: true, jsonPointers: true });
const validate = ajv.addSchema(ruleSchema).compile(rulesetSchema);

const serializeAJVErrors = (errors: ErrorObject[]) =>
  errors.map(({ message, dataPath }) => `${dataPath} ${message}`).join('\n');

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
    throw new ValidationError(validate.errors);
  }

  return ruleset as IRulesetFile;
}

export function isValidRule(rule: FileRule): rule is IRule {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}

export function decorateIFunctionWithSchemaValidation(fn: IFunction<any>, schema: JSONSchema) {
  return (data: unknown, opts: unknown, ...args: [IFunctionPaths, IFunctionValues]) => {
    if (!ajv.validate(schema, opts)) {
      throw new ValidationError(ajv.errors);
    }

    return fn(data, opts, ...args);
  };
}
