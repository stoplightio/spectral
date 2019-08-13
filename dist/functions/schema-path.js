"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
const { JSONPath } = require('jsonpath-plus');
exports.schemaPath = (targetVal, opts, paths, otherValues) => {
    if (!targetVal || typeof targetVal !== 'object')
        return [];
    const { original: object } = otherValues;
    const relevantObject = opts.field ? object[opts.field] : object;
    if (!relevantObject)
        return [];
    let schemaObject;
    try {
        schemaObject = JSONPath({ path: opts.schemaPath, json: object })[0];
    }
    catch (error) {
        console.error(error);
    }
    return schema_1.schema(relevantObject, { schema: schemaObject }, paths, otherValues);
};
//# sourceMappingURL=schema-path.js.map