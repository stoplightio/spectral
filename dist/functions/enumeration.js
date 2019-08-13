"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumeration = (targetVal, opts) => {
    const results = [];
    const { values } = opts;
    if (!targetVal)
        return results;
    if (!values.includes(targetVal)) {
        results.push({
            message: `${targetVal} does not equal to one of ${values}`,
        });
    }
    return results;
};
//# sourceMappingURL=enumeration.js.map