"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oasOpIdUnique = (targetVal, _options, functionPaths) => {
    const results = [];
    const { paths = {} } = targetVal;
    const ids = [];
    for (const path in paths) {
        if (Object.keys(paths[path]).length > 0) {
            for (const operation in paths[path]) {
                if (operation !== 'parameters') {
                    const { operationId } = paths[path][operation];
                    if (operationId) {
                        ids.push({
                            path: ['paths', path, operation, 'operationId'],
                            operationId,
                        });
                    }
                }
            }
        }
    }
    ids.forEach(operationId => {
        if (ids.filter(id => id.operationId === operationId.operationId).length > 1) {
            results.push({
                message: 'operationId must be unique',
                path: operationId.path || functionPaths.given,
            });
        }
    });
    return results;
};
//# sourceMappingURL=index.js.map