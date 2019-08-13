"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AJV = require('ajv');
const ruleSchema = require("../meta/rule.schema.json");
const rulesetSchema = require("../meta/ruleset.schema.json");
const ajv = new AJV({ allErrors: true, jsonPointers: true });
const validate = ajv.addSchema(ruleSchema).compile(rulesetSchema);
function assertValidRuleset(ruleset) {
    if (ruleset === null || typeof ruleset !== 'object') {
        throw new Error('Provided ruleset is not an object');
    }
    if (!('rules' in ruleset)) {
        throw new Error('Ruleset must have rules property');
    }
    if (!validate(ruleset)) {
        throw new Error(validate.errors.map(({ message, dataPath }) => `${dataPath} ${message}`).join('\n'));
    }
    return ruleset;
}
exports.assertValidRuleset = assertValidRuleset;
function isValidRule(rule) {
    return typeof rule === 'object' && rule !== null && !Array.isArray(rule) && ('given' in rule || 'then' in rule);
}
exports.isValidRule = isValidRule;
//# sourceMappingURL=validation.js.map