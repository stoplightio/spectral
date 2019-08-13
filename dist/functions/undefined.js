"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.undefined = (targetVal, _opts, paths) => {
    if (typeof targetVal !== 'undefined') {
        return [
            {
                message: `${paths.target ? paths.target.join('.') : 'property'} should be undefined`,
            },
        ];
    }
};
//# sourceMappingURL=undefined.js.map