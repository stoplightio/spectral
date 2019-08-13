"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.falsy = (targetVal, _opts, paths) => {
    if (!!targetVal) {
        return [
            {
                message: `${paths.target ? paths.target.join('.') : 'property'} is not falsy`,
            },
        ];
    }
};
//# sourceMappingURL=falsy.js.map