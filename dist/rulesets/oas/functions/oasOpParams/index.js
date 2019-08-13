"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oasOpParams = (targetVal, _options, _paths, vals) => {
    const results = [];
    const { original: object } = vals;
    if (!object.paths) {
        return [];
    }
    for (const path in object.paths) {
        if (!object.paths[path])
            continue;
        for (const operation in object.paths[path]) {
            if (!object.paths[path][operation] || operation === 'parameters')
                continue;
            const params = object.paths[path][operation].parameters || [];
            const nonUnique = {};
            const inBoth = {};
            const inBody = {};
            if (params.length > 1) {
                for (const paramIndex in params) {
                    if (!params[paramIndex] || params[paramIndex].$ref)
                        continue;
                    for (const compareIndex in params) {
                        if (paramIndex <= compareIndex || params[compareIndex].$ref)
                            continue;
                        if (params[paramIndex].in === params[compareIndex].in &&
                            params[paramIndex].name === params[compareIndex].name) {
                            if (!nonUnique[`${params[paramIndex].in}-${params[paramIndex].name}`]) {
                                nonUnique[`${params[paramIndex].in}-${params[paramIndex].name}`] = {};
                            }
                            nonUnique[`${params[paramIndex].in}-${params[paramIndex].name}`][paramIndex] = params[paramIndex];
                            nonUnique[`${params[paramIndex].in}-${params[paramIndex].name}`][compareIndex] = params[compareIndex];
                        }
                        if (!inBoth[paramIndex] &&
                            ((params[paramIndex].in === 'body' && params[compareIndex].in === 'formData') ||
                                (params[paramIndex].in === 'formData' && params[compareIndex].in === 'body'))) {
                            inBoth[paramIndex] = params[paramIndex];
                            inBoth[compareIndex] = params[compareIndex];
                        }
                        if (!inBody[paramIndex] &&
                            params[paramIndex].in === 'body' &&
                            params[compareIndex].in === 'body') {
                            inBody[paramIndex] = params[paramIndex];
                            inBody[compareIndex] = params[compareIndex];
                        }
                    }
                }
                if (Object.keys(nonUnique).length > 0) {
                    for (const group in nonUnique) {
                        if (!nonUnique[group])
                            continue;
                        const firstMatch = Object.keys(nonUnique[group])[0];
                        const inVal = nonUnique[group][firstMatch].in;
                        const nameVal = nonUnique[group][firstMatch].name;
                        let message = `Operations must have unique \`name\` + \`in\` parameters.\nRepeats of \`in:${inVal}\` + \`name:${nameVal}\`\n\nParameters found at:\n`;
                        for (const index in nonUnique[group]) {
                            if (!inBody[index]) {
                                message += `[ \`paths\`, \`${path}\`, \`${operation}\`, \`${index}\` ]\n`;
                            }
                        }
                        results.push({
                            message,
                            path: ['paths', path, operation],
                        });
                    }
                }
                if (Object.keys(inBoth).length > 1) {
                    let message = 'Operation cannot have both `in:body` and `in:formData` parameters.\n\nParameters found at:\n';
                    for (const index in inBoth) {
                        if (!inBody[index]) {
                            message += `[ \`paths\`, \`${path}\`, \`${operation}\`, \`${index}\` ]\n`;
                        }
                    }
                    results.push({
                        message,
                        path: ['paths', path, operation],
                    });
                }
                if (Object.keys(inBody).length > 1) {
                    let message = 'Operation has multiple instances of the `in:body` parameter.\n\nParameters found at:\n';
                    for (const index in inBody) {
                        if (!inBody[index]) {
                            message += `[ \`paths\`, \`${path}\`, \`${operation}\`, \`${index}\` ]\n`;
                        }
                    }
                    results.push({
                        message,
                        path: ['paths', path, operation],
                    });
                }
            }
        }
    }
    return results;
};
//# sourceMappingURL=index.js.map