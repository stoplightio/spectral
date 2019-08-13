"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yaml_1 = require("@stoplight/yaml");
const reader_1 = require("../fs/reader");
const finder_1 = require("./finder");
const merger_1 = require("./merger");
const validation_1 = require("./validation");
function readRulesFromRulesets(...uris) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const base = {
            rules: {},
        };
        for (const uri of uris) {
            merger_1.mergeRulesets(base, yield readRulesFromRuleset(uri, uri));
        }
        return base.rules;
    });
}
exports.readRulesFromRulesets = readRulesFromRulesets;
function readRulesFromRuleset(baseUri, uri, severity) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const ruleset = validation_1.assertValidRuleset(yaml_1.parse(yield reader_1.readParsable(yield finder_1.findRuleset(baseUri, uri), 'utf8')));
        const newRuleset = {
            rules: {},
        };
        const extendedRulesets = ruleset.extends;
        if (extendedRulesets !== undefined) {
            for (const extended of Array.isArray(extendedRulesets) ? extendedRulesets : [extendedRulesets]) {
                if (Array.isArray(extended)) {
                    const parentSeverity = severity === undefined ? extended[1] : severity;
                    merger_1.mergeRulesets(newRuleset, yield readRulesFromRuleset(uri, extended[0], parentSeverity), parentSeverity);
                }
                else {
                    const parentSeverity = severity === undefined ? 'recommended' : severity;
                    merger_1.mergeRulesets(newRuleset, yield readRulesFromRuleset(uri, extended, parentSeverity), parentSeverity);
                }
            }
        }
        return merger_1.mergeRulesets(newRuleset, ruleset);
    });
}
//# sourceMappingURL=reader.js.map