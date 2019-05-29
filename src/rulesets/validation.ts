const AJV = require('ajv');
import { ErrorObject } from 'ajv';
import * as ruleSchema from '../meta/rule.schema.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';

const ajv = new AJV({ allErrors: true, jsonPointers: true });
const validate = ajv.addSchema(ruleSchema).compile(rulesetSchema);

export function validateRuleset(ruleset: object): ErrorObject[] {
  if (validate(ruleset)) {
    return [];
  }
  return validate.errors || [];
}
