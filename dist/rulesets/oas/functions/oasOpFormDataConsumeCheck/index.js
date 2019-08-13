"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oasOpFormDataConsumeCheck = targetVal => {
    const results = [];
    const parameters = targetVal.parameters;
    const consumes = targetVal.consumes || [];
    if (parameters && parameters.find((p) => p.in === 'formData')) {
        if (!consumes.join(',').match(/(application\/x-www-form-urlencoded|multipart\/form-data)/)) {
            results.push({
                message: 'consumes must include urlencoded, multipart, or formdata media type when using formData parameter',
            });
        }
    }
    return results;
};
//# sourceMappingURL=index.js.map