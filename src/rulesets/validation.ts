import { FileRule, IRulesetFile } from '../types/ruleset';

import { ErrorObject } from 'ajv';
const AJV = require('ajv');
import * as ruleSchema from '../meta/rule.schema.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';
import { Rule } from '../types';

const ajv = new AJV({ allErrors: true, jsonPointers: true });
const validate = ajv.addSchema(ruleSchema).compile(rulesetSchema);

export function assertValidRuleset(ruleset: unknown): IRulesetFile {
  if (ruleset === null || typeof ruleset !== 'object') {
    throw new Error('Provided ruleset is not an object');
  }

  if (!('rules' in ruleset!)) {
    throw new Error('Ruleset must have rules property');
  }

  if (!validate(ruleset)) {
    throw new Error(
      (validate.errors as ErrorObject[]).map(({ message, dataPath }) => `${dataPath} ${message}`).join('\n'),
    );
  }

  return ruleset as IRulesetFile;
}

export function isValidRule(rule: FileRule): rule is Rule {
  return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}
