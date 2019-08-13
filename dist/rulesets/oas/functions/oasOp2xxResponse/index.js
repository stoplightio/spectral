"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oasOp2xxResponse = targetVal => {
    const results = [];
    const responses = Object.keys(targetVal);
    if (responses.filter(response => Number(response) >= 200 && Number(response) < 300).length === 0) {
        results.push({
            message: 'operations must define at least one 2xx response',
        });
    }
    return results;
};
//# sourceMappingURL=index.js.map