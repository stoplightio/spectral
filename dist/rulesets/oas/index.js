"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const reader_1 = require("../reader");
exports.commonOasFunctions = () => {
    return {
        oasPathParam: require('./functions/oasPathParam').oasPathParam,
        oasOp2xxResponse: require('./functions/oasOp2xxResponse').oasOp2xxResponse,
        oasOpSecurityDefined: require('./functions/oasOpSecurityDefined').oasOpSecurityDefined,
        oasOpIdUnique: require('./functions/oasOpIdUnique').oasOpIdUnique,
        oasOpFormDataConsumeCheck: require('./functions/oasOpFormDataConsumeCheck').oasOpFormDataConsumeCheck,
        oasOpParams: require('./functions/oasOpParams').oasOpParams,
    };
};
exports.rules = () => tslib_1.__awaiter(this, void 0, void 0, function* () { return reader_1.readRulesFromRulesets(require.resolve('./index.json')); });
//# sourceMappingURL=index.js.map