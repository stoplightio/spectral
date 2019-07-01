import { IRulesetFile } from '../types/ruleset';

const AJV = require('ajv');
import * as ruleSchema from '../meta/rule.schema.json';
import * as rulesetSchema from '../meta/ruleset.schema.json';

const ajv = new AJV({ allErrors: true, jsonPointers: true });
const validate = ajv.addSchema(ruleSchema).compile(rulesetSchema);

export function assertValidRuleset(ruleset: unknown): IRulesetFile {
  if (ruleset === null || typeof ruleset !== 'object' || !('rules' in ruleset!) || !validate(ruleset)) {
    throw new Error('Provided ruleset is not valid');
  }

  return ruleset as IRulesetFile;
}
