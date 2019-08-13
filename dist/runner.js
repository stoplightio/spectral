"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { JSONPath } = require('jsonpath-plus');
const linter_1 = require("./linter");
const severity_1 = require("./rulesets/severity");
exports.runRules = (resolved, rules, functions) => {
    let results = [];
    for (const name in rules) {
        if (!rules.hasOwnProperty(name))
            continue;
        const rule = rules[name];
        if (!rule)
            continue;
        if (rule.severity !== undefined && severity_1.getDiagnosticSeverity(rule.severity) === -1) {
            continue;
        }
        try {
            results = results.concat(runRule(resolved, rule, functions));
        }
        catch (e) {
            console.error(`Unable to run rule '${name}':\n${e}`);
        }
    }
    return results;
};
const runRule = (resolved, rule, functions) => {
    const { result: target } = resolved;
    let results = [];
    const nodes = [];
    if (rule.given && rule.given !== '$') {
        try {
            JSONPath({
                path: rule.given,
                json: target,
                resultType: 'all',
                callback: (result) => {
                    nodes.push({
                        path: JSONPath.toPathArray(result.path),
                        value: result.value,
                    });
                },
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    else {
        nodes.push({
            path: ['$'],
            value: target,
        });
    }
    for (const node of nodes) {
        try {
            const thens = Array.isArray(rule.then) ? rule.then : [rule.then];
            for (const then of thens) {
                const func = functions[then.function];
                if (!func) {
                    console.warn(`Function ${then.function} not found. Called by rule ${rule.name}.`);
                    continue;
                }
                results = results.concat(linter_1.lintNode(node, rule, then, func, resolved));
            }
        }
        catch (e) {
            console.warn(`Encountered error when running rule '${rule.name}' on node at path '${node.path}':\n${e}`);
        }
    }
    return results;
};
//# sourceMappingURL=runner.js.map