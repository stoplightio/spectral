"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const reader_1 = require("../reader");
var oas_1 = require("../oas");
exports.oas2Functions = oas_1.commonOasFunctions;
exports.rules = () => tslib_1.__awaiter(this, void 0, void 0, function* () { return reader_1.readRulesFromRulesets(require.resolve('./index.json')); });
//# sourceMappingURL=index.js.map