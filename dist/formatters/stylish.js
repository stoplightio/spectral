"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const strip_ansi_1 = require("strip-ansi");
const table = require("text-table");
const types_1 = require("@stoplight/types");
function pluralize(word, count) {
    return count === 1 ? word : `${word}s`;
}
exports.stylish = (results) => {
    let output = '\n';
    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;
    let summaryColor = 'white';
    const groupedResults = groupBySource(results);
    Object.keys(groupedResults).map((path, index) => {
        const pathResults = groupedResults[path];
        const errors = pathResults.filter((result) => result.severity === types_1.DiagnosticSeverity.Error);
        const warnings = pathResults.filter((result) => result.severity === types_1.DiagnosticSeverity.Warning);
        const infos = pathResults.filter((result) => result.severity === types_1.DiagnosticSeverity.Information);
        errorCount += errors.length;
        warningCount += warnings.length;
        infoCount += infos.length;
        output += `${chalk_1.default.underline(path)}\n`;
        const pathTableData = sortResults(pathResults).map((result) => {
            let messageType;
            if (result.severity === types_1.DiagnosticSeverity.Error) {
                messageType = chalk_1.default.red('error');
                summaryColor = 'red';
            }
            else if (result.severity === types_1.DiagnosticSeverity.Warning) {
                messageType = chalk_1.default.yellow('warning');
                if (summaryColor !== 'red') {
                    summaryColor = 'yellow';
                }
            }
            else {
                messageType = chalk_1.default.yellow('white');
            }
            return [formatRange(result.range), messageType, result.code !== undefined ? result.code : '', result.message];
        });
        output += `${table(pathTableData, {
            align: ['c', 'r', 'l'],
            stringLength(str) {
                return strip_ansi_1.default(str).length;
            },
        })
            .split('\n')
            .map((el) => el.replace(/(\d+)\s+(\d+)/u, (m, p1, p2) => chalk_1.default.dim(`${p1}:${p2}`)))
            .join('\n')}\n\n`;
    });
    const total = errorCount + warningCount + infoCount;
    if (total > 0) {
        output += chalk_1.default[summaryColor].bold([
            '\u2716 ',
            total,
            pluralize(' problem', total),
            ' (',
            errorCount,
            pluralize(' error', errorCount),
            ', ',
            warningCount,
            pluralize(' warning', warningCount),
            ', ',
            infoCount,
            pluralize(' info', infoCount),
            ')\n',
        ].join(''));
    }
    return total > 0 ? output : '';
};
const groupBySource = (results) => {
    return results.reduce((grouped, result) => {
        (grouped[result.source] = grouped[result.source] || []).push(result);
        return grouped;
    }, {});
};
const formatRange = (range) => {
    if (!range)
        return '';
    return ` ${range.start.line + 1}:${range.start.character + 1}`;
};
const sortResults = (results) => {
    return [...results].sort((resultA, resultB) => {
        const diff = resultA.range.start.line - resultB.range.start.line;
        if (diff === 0) {
            return resultA.range.start.character - resultB.range.start.character;
        }
        return diff;
    });
};
//# sourceMappingURL=stylish.js.map