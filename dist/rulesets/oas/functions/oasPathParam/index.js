"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pathRegex = /(\{[a-zA-Z0-9_-]+\})+/g;
exports.oasPathParam = (targetVal, _options, paths, vals) => {
    const results = [];
    const { original: object } = vals;
    if (!object.paths) {
        return [];
    }
    const uniquePaths = {};
    for (const path in object.paths) {
        if (!object.paths[path])
            continue;
        const normalized = path.replace(pathRegex, '%');
        if (uniquePaths[normalized]) {
            results.push(generateResult(`The paths "**${uniquePaths[normalized]}**" and "**${path}**" are equivalent.

To fix, remove one of the paths or merge them together.`, [...paths.given, 'paths']));
        }
        else {
            uniquePaths[normalized] = path;
        }
        const pathElements = {};
        while (true) {
            const match = pathRegex.exec(path);
            if (match && match.length > 0) {
                const p = match[0].replace(/[\{\}]/g, '');
                if (pathElements[p]) {
                    results.push(generateResult(`The path "**${path}**" uses the parameter "**{${p}}**" multiple times.

Path parameters must be unique.

To fix, update the path so that all parameter names are unique.`, [...paths.given, 'paths', path]));
                }
                else {
                    pathElements[p] = {};
                }
                continue;
            }
            break;
        }
        const topParams = {};
        if (object.paths[path].parameters) {
            for (const p of object.paths[path].parameters) {
                if (p.in && p.in === 'path' && p.name) {
                    if (!p.required) {
                        results.push(generateResult(requiredMessage(p.name), [...paths.given, 'paths', path, 'parameters']));
                    }
                    if (topParams[p.name]) {
                        results.push(generateResult(uniqueDefinitionMessage(p.name), [...paths.given, 'paths', path, 'parameters']));
                        continue;
                    }
                    topParams[p.name] = [...paths.given, 'paths', path, 'parameters'];
                }
            }
        }
        const operationParams = {};
        for (const op in object.paths[path]) {
            if (!object.paths[path][op])
                continue;
            if (op === 'parameters') {
                continue;
            }
            const parameters = object.paths[path][op].parameters;
            if (parameters) {
                const tmp = {};
                for (const i in parameters) {
                    if (!parameters.hasOwnProperty(i))
                        continue;
                    const p = parameters[i];
                    if (p.in && p.in === 'path' && p.name) {
                        const parameterPath = ['paths', path, op, 'parameters', i];
                        if (!p.required) {
                            results.push(generateResult(requiredMessage(p.name), [...paths.given, ...parameterPath]));
                        }
                        if (tmp[p.name]) {
                            results.push(generateResult(uniqueDefinitionMessage(p.name), [...paths.given, ...parameterPath]));
                            continue;
                        }
                        else if (operationParams[p.name]) {
                            continue;
                        }
                        tmp[p.name] = {};
                        operationParams[p.name] = parameterPath;
                    }
                }
            }
        }
        for (const p in pathElements) {
            if (!pathElements[p])
                continue;
            if (!topParams[p] && !operationParams[p]) {
                results.push(generateResult(`The path "**${path}**" uses a parameter "**{${p}}**" that does not have a corresponding definition.

To fix, add a path parameter with the name "**${p}**".`, [...paths.given, 'paths', path]));
            }
        }
        for (const paramObj of [topParams, operationParams]) {
            for (const p in paramObj) {
                if (!paramObj[p])
                    continue;
                if (!pathElements[p]) {
                    const resPath = paramObj[p];
                    results.push(generateResult(`Parameter "**${p}**" is not used in the path "**${path}**".

Unused parameters are not allowed.

To fix, remove this parameter.`, [...paths.given, ...resPath]));
                }
            }
        }
    }
    return results;
};
function generateResult(message, path) {
    return {
        message,
        path,
    };
}
const requiredMessage = (name) => `Path parameter "**${name}**" must have a \`required\` that is set to \`true\`.

To fix, mark this parameter as required.`;
const uniqueDefinitionMessage = (name) => `Path parameter '**${name}**' is defined multiple times.

Path parameters must be unique.

To fix, remove the duplicate parameters.`;
//# sourceMappingURL=index.js.map