"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@stoplight/types");
const lodash_1 = require("lodash");
const toUpperCase = (word) => word.toUpperCase();
const splitWord = (word, end, start) => `${end} ${start.toLowerCase()}`;
function getDiagnosticErrorMessage(diagnostic) {
    const key = getPropertyKey(diagnostic.path);
    let prettifiedMessage = diagnostic.message.replace(/^[a-z]/, toUpperCase);
    if (diagnostic.code !== 'YAMLException') {
        prettifiedMessage = prettifiedMessage.replace(/([a-z])([A-Z])/g, splitWord);
    }
    if (key !== undefined) {
        prettifiedMessage = prettifiedMessage.replace(/(Duplicate key)/, `$1: ${key}`);
    }
    return prettifiedMessage;
}
exports.getDiagnosticErrorMessage = getDiagnosticErrorMessage;
exports.prettyPrintResolverErrorMessage = (message) => message.replace(/^Error\s*:\s*/, '');
const getPropertyKey = (path) => {
    if (path !== undefined && path.length > 0) {
        return path[path.length - 1];
    }
};
function formatParserDiagnostics(diagnostics, source) {
    return diagnostics.map(diagnostic => (Object.assign({}, diagnostic, { code: 'parser', message: getDiagnosticErrorMessage(diagnostic), path: diagnostic.path || [], source })));
}
exports.formatParserDiagnostics = formatParserDiagnostics;
exports.formatResolverErrors = (resolved) => {
    return lodash_1.uniqBy(resolved.errors, 'message').reduce((errors, error) => {
        const path = [...error.path, '$ref'];
        const location = resolved.getLocationForJsonPath(path);
        if (location) {
            errors.push({
                code: 'invalid-ref',
                path,
                message: exports.prettyPrintResolverErrorMessage(error.message),
                severity: types_1.DiagnosticSeverity.Error,
                range: location.range,
                source: resolved.spec.source,
            });
        }
        return errors;
    }, []);
};
//# sourceMappingURL=error-messages.js.map