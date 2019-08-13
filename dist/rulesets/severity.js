"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const validation_1 = require("./validation");
exports.DEFAULT_SEVERITY_LEVEL = types_1.DiagnosticSeverity.Warning;
function getSeverityForRule(rule, defaultSeverity) {
    switch (typeof rule) {
        case 'number':
        case 'string':
            return getDiagnosticSeverity(rule);
        case 'boolean':
            return rule ? getDiagnosticSeverity(defaultSeverity) : -1;
        default:
            return defaultSeverity;
    }
}
function getSeverityForInvalidRule(existingRule, newRule) {
    if (newRule === 'off')
        return -1;
    if (newRule === 'recommended' || newRule === 'all') {
        if (existingRule === false || existingRule === -1 || existingRule === 'off') {
            return -1;
        }
        return getSeverityForRule(existingRule, exports.DEFAULT_SEVERITY_LEVEL);
    }
    return getSeverityForRule(newRule, exports.DEFAULT_SEVERITY_LEVEL);
}
function getSeverityLevel(rules, name, newRule) {
    const existingRule = rules[name];
    if (!validation_1.isValidRule(existingRule)) {
        return getSeverityForInvalidRule(existingRule, newRule);
    }
    const existingSeverity = existingRule.severity !== undefined ? getDiagnosticSeverity(existingRule.severity) : exports.DEFAULT_SEVERITY_LEVEL;
    if (newRule === 'recommended') {
        return existingRule.recommended ? existingSeverity : -1;
    }
    if (newRule === 'all') {
        return existingSeverity;
    }
    return getSeverityForRule(newRule, existingSeverity);
}
exports.getSeverityLevel = getSeverityLevel;
const SEVERITY_MAP = {
    error: types_1.DiagnosticSeverity.Error,
    warn: types_1.DiagnosticSeverity.Warning,
    info: types_1.DiagnosticSeverity.Information,
    hint: types_1.DiagnosticSeverity.Hint,
    off: -1,
};
function getDiagnosticSeverity(severity) {
    if (Number.isNaN(Number(severity))) {
        return SEVERITY_MAP[severity];
    }
    return Number(severity);
}
exports.getDiagnosticSeverity = getDiagnosticSeverity;
//# sourceMappingURL=severity.js.map