"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truthy = (targetVal, _opts, paths) => {
    if (!targetVal) {
        return [
            {
                message: `${paths.target ? paths.target.join('.') : 'property'} is not truthy`,
            },
        ];
    }
};
//# sourceMappingURL=truthy.js.map