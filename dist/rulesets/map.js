"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resolveSpectralRuleset(ruleset) {
    return `@stoplight/spectral/rulesets/${ruleset}/index.json`;
}
exports.rulesetsMap = new Map([
    ['spectral:oas', resolveSpectralRuleset('oas')],
    ['spectral:oas2', resolveSpectralRuleset('oas2')],
    ['spectral:oas3', resolveSpectralRuleset('oas3')],
]);
//# sourceMappingURL=map.js.map