"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
exports.alphabetical = (targetVal, opts) => {
    const results = [];
    if (!targetVal) {
        return results;
    }
    let targetArray = targetVal;
    if (!Array.isArray(targetVal)) {
        targetArray = Object.keys(targetVal);
    }
    const copiedArray = targetArray.slice();
    if (copiedArray.length < 2) {
        return results;
    }
    const { keyedBy } = opts;
    if (keyedBy) {
        copiedArray.sort((a, b) => {
            if (typeof a !== 'object') {
                return 0;
            }
            if (a[keyedBy] < b[keyedBy]) {
                return -1;
            }
            else if (a[keyedBy] > b[keyedBy]) {
                return 1;
            }
            return 0;
        });
    }
    else {
        copiedArray.sort();
    }
    if (!lodash_1.isEqual(targetArray, copiedArray)) {
        results.push({
            message: 'properties are not in alphabetical order',
        });
    }
    return results;
};
//# sourceMappingURL=alphabetical.js.map