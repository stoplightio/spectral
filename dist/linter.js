"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const { JSONPath } = require('jsonpath-plus');
const message_1 = require("./rulesets/message");
const severity_1 = require("./rulesets/severity");
exports.lintNode = (node, rule, then, apply, resolved) => {
    const givenPath = node.path[0] === '$' ? node.path.slice(1) : node.path;
    const conditioning = exports.whatShouldBeLinted(givenPath, node.value, rule);
    if (!conditioning.lint) {
        return [];
    }
    const targetValue = conditioning.value;
    const targets = [];
    if (then && then.field) {
        if (then.field === '@key') {
            for (const key of Object.keys(targetValue)) {
                targets.push({
                    path: key,
                    value: key,
                });
            }
        }
        else if (then.field[0] === '$') {
            try {
                JSONPath({
                    path: then.field,
                    json: targetValue,
                    resultType: 'all',
                    callback: (result) => {
                        targets.push({
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
            targets.push({
                path: typeof then.field === 'string' ? then.field.split('.') : then.field,
                value: lodash_1.get(targetValue, then.field),
            });
        }
    }
    else {
        targets.push({
            path: [],
            value: targetValue,
        });
    }
    if (!targets.length) {
        targets.push({
            path: [],
            value: undefined,
        });
    }
    let results = [];
    for (const target of targets) {
        const targetPath = givenPath.concat(target.path);
        const targetResults = apply(target.value, then.functionOptions || {}, {
            given: givenPath,
            target: targetPath,
        }, {
            original: node.value,
            given: node.value,
        }) || [];
        results = results.concat(targetResults.map(result => {
            const path = result.path || targetPath;
            const location = resolved.getLocationForJsonPath(path, true);
            return Object.assign({ code: rule.name, message: rule.message === undefined
                    ? rule.description || result.message
                    : message_1.message(rule.message, {
                        error: result.message,
                        property: path.length > 0 ? path[path.length - 1] : '',
                        description: rule.description,
                    }), path, severity: severity_1.getDiagnosticSeverity(rule.severity), source: location.uri }, (location || {
                range: {
                    start: {
                        character: 0,
                        line: 0,
                    },
                    end: {
                        character: 0,
                        line: 0,
                    },
                },
            }));
        }));
    }
    return results;
};
exports.whatShouldBeLinted = (path, originalValue, rule) => {
    const leaf = path[path.length - 1];
    const when = rule.when;
    if (!when) {
        return {
            lint: true,
            value: originalValue,
        };
    }
    const pattern = when.pattern;
    const field = when.field;
    const isKey = field === '@key';
    if (!pattern) {
        if (isKey) {
            return {
                lint: false,
                value: originalValue,
            };
        }
        return {
            lint: lodash_1.has(originalValue, field),
            value: originalValue,
        };
    }
    if (isKey && pattern) {
        return keyAndOptionalPattern(leaf, pattern, originalValue);
    }
    const fieldValue = String(lodash_1.get(originalValue, when.field));
    return {
        lint: fieldValue.match(pattern) !== null,
        value: originalValue,
    };
};
function keyAndOptionalPattern(key, pattern, value) {
    if (typeof key === 'number' && typeof value === 'object') {
        for (const k of Object.keys(value)) {
            if (String(k).match(pattern)) {
                return {
                    lint: true,
                    value,
                };
            }
        }
    }
    else if (String(key).match(pattern)) {
        return {
            lint: true,
            value,
        };
    }
    return {
        lint: false,
        value,
    };
}
//# sourceMappingURL=linter.js.map