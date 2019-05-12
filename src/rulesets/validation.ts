const AJV = require('ajv');
import { ErrorObject } from 'ajv';
const ruleSchema = require('../meta/rule.schema.json');
const rulesetSchema = require('../meta/ruleset.schema.json');
import { IRuleset } from '../types/ruleset';

const ajv = new AJV({ allErrors: true, jsonPointers: true });
const validate = ajv.addSchema(ruleSchema).compile(rulesetSchema);

export function validateRuleset(ruleset: IRuleset): ErrorObject[] {
  if (validate(ruleset)) {
    return [];
  }
  return validate.errors || [];
}
