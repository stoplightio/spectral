"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const severity_1 = require("./severity");
const validation_1 = require("./validation");
function mergeRulesets(target, src, rulesetSeverity) {
    const { rules } = target;
    for (const [name, rule] of Object.entries(src.rules)) {
        if (rulesetSeverity !== undefined) {
            const severity = severity_1.getSeverityLevel(src.rules, name, rulesetSeverity);
            if (validation_1.isValidRule(rule)) {
                rule.severity = severity;
                processRule(rules, name, rule);
            }
            else {
                processRule(rules, name, severity);
            }
        }
        else {
            processRule(rules, name, rule);
        }
    }
    return target;
}
exports.mergeRulesets = mergeRulesets;
const ROOT_DESCRIPTOR = Symbol('root-descriptor');
function markRule(rule) {
    if (!(ROOT_DESCRIPTOR in rule)) {
        Object.defineProperty(rule, ROOT_DESCRIPTOR, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: copyRule(rule),
        });
    }
}
function updateRootRule(root, newRule) {
    markRule(root);
    Object.assign(root[ROOT_DESCRIPTOR], copyRule(newRule === null ? root : Object.assign(root, newRule)));
}
function getRootRule(rule) {
    return rule[ROOT_DESCRIPTOR] !== undefined ? rule[ROOT_DESCRIPTOR] : null;
}
function copyRule(rule) {
    return lodash_1.cloneDeep(rule);
}
function processRule(rules, name, rule) {
    const existingRule = rules[name];
    switch (typeof rule) {
        case 'boolean':
            if (validation_1.isValidRule(existingRule)) {
                const rootRule = getRootRule(existingRule);
                existingRule.severity = rootRule ? rootRule.severity : severity_1.getSeverityLevel(rules, name, rule);
                updateRootRule(existingRule, existingRule);
            }
            break;
        case 'string':
        case 'number':
            if (validation_1.isValidRule(existingRule)) {
                existingRule.severity = severity_1.getSeverityLevel(rules, name, rule);
            }
            break;
        case 'object':
            normalizeRule(rule);
            if (Array.isArray(rule)) {
                processRule(rules, name, rule[0]);
                if (validation_1.isValidRule(existingRule) && rule.length === 2 && rule[1] !== undefined) {
                    if ('functionOptions' in existingRule.then) {
                        existingRule.then.functionOptions = rule[1];
                    }
                    updateRootRule(existingRule, null);
                }
            }
            else if (validation_1.isValidRule(existingRule)) {
                updateRootRule(existingRule, rule);
            }
            else {
                markRule(rule);
                rules[name] = rule;
            }
            break;
        default:
            throw new Error('Invalid value for a rule');
    }
}
function normalizeRule(rule) {
    if (validation_1.isValidRule(rule)) {
        if (rule.severity === undefined) {
            rule.severity = severity_1.DEFAULT_SEVERITY_LEVEL;
        }
        else {
            rule.severity = severity_1.getDiagnosticSeverity(rule.severity);
        }
    }
}
//# sourceMappingURL=merger.js.map