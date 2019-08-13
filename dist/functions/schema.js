"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AJV = require("ajv");
const jsonSpecv4 = require("ajv/lib/refs/json-schema-draft-04.json");
const oasFormatValidator = require('ajv-oai/lib/format-validator');
const betterAjvErrors = require('better-ajv-errors/lib/modern');
const ajv = new AJV({
    meta: false,
    schemaId: 'auto',
    jsonPointers: true,
    unknownFormats: 'ignore',
});
ajv.addMetaSchema(jsonSpecv4);
ajv._opts.defaultMeta = jsonSpecv4.id;
ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';
ajv.addFormat('int32', { type: 'number', validate: oasFormatValidator.int32 });
ajv.addFormat('int64', { type: 'number', validate: oasFormatValidator.int64 });
ajv.addFormat('float', { type: 'number', validate: oasFormatValidator.float });
ajv.addFormat('double', { type: 'number', validate: oasFormatValidator.double });
ajv.addFormat('byte', { type: 'string', validate: oasFormatValidator.byte });
const validators = new class extends WeakMap {
    get(schemaObj) {
        let validator = super.get(schemaObj);
        if (validator === void 0) {
            validator = ajv.compile(schemaObj);
            super.set(schemaObj, validator);
        }
        return validator;
    }
}();
const cleanAJVErrorMessage = (message) => message.trim().replace(/^[^:]*:\s*/, '');
exports.schema = (targetVal, opts, paths) => {
    const results = [];
    const path = paths.target || paths.given;
    if (!targetVal)
        return [
            {
                path,
                message: `${paths ? path.join('.') : 'property'} does not exist`,
            },
        ];
    const { schema: schemaObj } = opts;
    try {
        const validator = validators.get(schemaObj);
        if (!validator(targetVal) && validator.errors) {
            results.push(...betterAjvErrors(schemaObj, targetVal, validator.errors, { format: 'js' }).map(({ error, path: errorPath }) => {
                return {
                    message: cleanAJVErrorMessage(error),
                    path: [...path, ...(errorPath ? errorPath.replace(/^\//, '').split('/') : [])],
                };
            }));
        }
    }
    catch (ex) {
        if (ex instanceof AJV.MissingRefError) {
            results.push({
                message: ex.message,
                path,
            });
        }
        else {
            throw ex;
        }
    }
    return results;
};
//# sourceMappingURL=schema.js.map