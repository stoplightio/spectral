"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BRACES = /{{([^}]+)}}/g;
exports.message = (str, values) => {
    BRACES.lastIndex = 0;
    let result = null;
    while ((result = BRACES.exec(str))) {
        const newValue = String(values[result[1]] || '');
        str = `${str.slice(0, result.index)}${newValue}${str.slice(BRACES.lastIndex)}`;
        BRACES.lastIndex = result.index + newValue.length;
    }
    return str;
};
//# sourceMappingURL=message.js.map