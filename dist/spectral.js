"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const json_1 = require("@stoplight/json");
const json_2 = require("@stoplight/json");
const dist_1 = require("@stoplight/json-ref-resolver/dist");
const path_1 = require("@stoplight/path");
const yaml_1 = require("@stoplight/yaml");
const lodash_1 = require("lodash");
const error_messages_1 = require("./error-messages");
const functions_1 = require("./functions");
const resolved_1 = require("./resolved");
const severity_1 = require("./rulesets/severity");
const runner_1 = require("./runner");
tslib_1.__exportStar(require("./types"), exports);
class Spectral {
    constructor(opts) {
        this._rules = {};
        this._functions = functions_1.functions;
        this._parsedMap = {
            refs: {},
            parsed: {},
            pointers: {},
        };
        this._resolver = opts && opts.resolver ? opts.resolver : new dist_1.Resolver();
    }
    run(target, opts = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let results = [];
            let parsedResult;
            if (!exports.isParsedResult(target)) {
                parsedResult = {
                    parsed: yaml_1.parseWithPointers(typeof target === 'string' ? target : json_1.safeStringify(target, undefined, 2), {
                        ignoreDuplicateKeys: false,
                        mergeKeys: true,
                    }),
                    getLocationForJsonPath: yaml_1.getLocationForJsonPath,
                };
            }
            else {
                parsedResult = target;
            }
            results = results.concat(error_messages_1.formatParserDiagnostics(parsedResult.parsed.diagnostics, parsedResult.source));
            const documentUri = opts.resolve && opts.resolve.documentUri;
            const refDiagnostics = [];
            const resolved = new resolved_1.Resolved(parsedResult, yield this._resolver.resolve(parsedResult.parsed.data, {
                baseUri: documentUri,
                parseResolveResult: (resolveOpts) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const ref = resolveOpts.targetAuthority.toString();
                    const ext = path_1.extname(ref);
                    const content = String(resolveOpts.result);
                    let parsedRefResult;
                    if (ext === '.yml' || ext === '.yaml') {
                        parsedRefResult = {
                            parsed: yaml_1.parseWithPointers(content, { ignoreDuplicateKeys: false }),
                            source: ref,
                            getLocationForJsonPath: yaml_1.getLocationForJsonPath,
                        };
                    }
                    else if (ext === '.json') {
                        parsedRefResult = {
                            parsed: json_2.parseWithPointers(content, { ignoreDuplicateKeys: false }),
                            source: ref,
                            getLocationForJsonPath: json_2.getLocationForJsonPath,
                        };
                    }
                    if (parsedRefResult !== undefined) {
                        resolveOpts.result = parsedRefResult.parsed.data;
                        if (parsedRefResult.parsed.diagnostics.length > 0) {
                            refDiagnostics.push(...error_messages_1.formatParserDiagnostics(parsedRefResult.parsed.diagnostics, parsedRefResult.source));
                        }
                        this._processExternalRef(parsedRefResult, resolveOpts);
                    }
                    return resolveOpts;
                }),
            }), this._parsedMap);
            return [
                ...refDiagnostics,
                ...results,
                ...error_messages_1.formatResolverErrors(resolved),
                ...runner_1.runRules(resolved, this.rules, this.functions),
            ];
        });
    }
    get functions() {
        return this._functions;
    }
    addFunctions(functions) {
        Object.assign(this._functions, lodash_1.merge({}, functions));
    }
    get rules() {
        const rules = {};
        for (const name in this._rules) {
            if (!this._rules.hasOwnProperty(name))
                continue;
            const rule = this._rules[name];
            rules[name] = Object.assign({ name }, rule, { severity: rule.severity === undefined ? severity_1.DEFAULT_SEVERITY_LEVEL : severity_1.getDiagnosticSeverity(rule.severity) });
        }
        return rules;
    }
    addRules(rules) {
        Object.assign(this._rules, lodash_1.merge({}, rules));
    }
    mergeRules(rules) {
        for (const ruleName in lodash_1.merge({}, rules)) {
            if (!rules.hasOwnProperty(ruleName))
                continue;
            const rule = rules[ruleName];
            if (rule) {
                this._rules[ruleName] = lodash_1.merge(this._rules[ruleName], rule);
            }
        }
    }
    applyRuleDeclarations(declarations) {
        for (const ruleName in declarations) {
            if (!declarations.hasOwnProperty(ruleName))
                continue;
            const declaration = declarations[ruleName];
            const rule = this.rules[ruleName];
            if (rule) {
                if (typeof declaration === 'boolean') {
                    this._rules[ruleName].recommended = declaration;
                }
            }
        }
    }
    _processExternalRef(parsedResult, opts) {
        const ref = opts.targetAuthority.toString();
        this._parsedMap.parsed[ref] = parsedResult;
        this._parsedMap.pointers[ref] = opts.parentPath;
        const parentRef = opts.parentAuthority.toString();
        lodash_1.set(this._parsedMap.refs, [...(this._parsedMap.pointers[parentRef] ? this._parsedMap.pointers[parentRef] : []), ...opts.parentPath], Object.defineProperty({}, exports.REF_METADATA, {
            enumerable: false,
            writable: false,
            value: {
                ref,
                root: opts.fragment.split('/').slice(1),
            },
        }));
    }
}
exports.Spectral = Spectral;
exports.REF_METADATA = Symbol('external_ref_metadata');
exports.isParsedResult = (obj) => {
    if (!obj || typeof obj !== 'object')
        return false;
    if (!obj.parsed || typeof obj.parsed !== 'object')
        return false;
    if (!obj.getLocationForJsonPath || typeof obj.getLocationForJsonPath !== 'function')
        return false;
    return true;
};
//# sourceMappingURL=spectral.js.map