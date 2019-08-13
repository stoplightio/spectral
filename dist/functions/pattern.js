"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function test(value, regex) {
    let re;
    if (typeof regex === 'string') {
        const splitRegex = /^\/(.+)\/([a-z]*)$/.exec(regex);
        if (splitRegex) {
            re = new RegExp(splitRegex[1], splitRegex[2]);
        }
        else {
            re = new RegExp(regex);
        }
    }
    else {
        re = new RegExp(regex);
    }
    return re.test(value);
}
exports.pattern = (targetVal, opts) => {
    const results = [];
    if (!targetVal || typeof targetVal !== 'string')
        return results;
    const { match, notMatch } = opts;
    if (match) {
        if (test(targetVal, match) !== true) {
            results.push({
                message: `must match the pattern '${match}'`,
            });
        }
    }
    if (notMatch) {
        if (test(targetVal, notMatch) === true) {
            results.push({
                message: `must not match the pattern '${notMatch}'`,
            });
        }
    }
    return results;
};
//# sourceMappingURL=pattern.js.map