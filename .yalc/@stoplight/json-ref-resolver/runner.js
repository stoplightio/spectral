"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const json_1 = require("@stoplight/json");
const immer_1 = require("immer");
const lodash_1 = require("lodash");
const path_1 = require("path");
const URI = require("urijs");
const vscode_uri_1 = require("vscode-uri");
const cache_1 = require("./cache");
const crawler_1 = require("./crawler");
const Utils = require("./utils");
const memoize = require('fast-memoize');
let resolveRunnerCount = 0;
exports.defaultGetRef = (key, val) => {
    if (val && typeof val === 'object' && typeof val.$ref === 'string')
        return val.$ref;
    return;
};
class ResolveRunner {
    constructor(source, opts = {}) {
        this.ctx = {};
        this.computeRef = (opts) => {
            const refStr = this.getRef(opts.key, opts.val, opts);
            if (!refStr)
                return;
            let ref = new URI(refStr);
            if (ref.toString().charAt(0) !== '#') {
                const isFile = this.isFile(ref);
                if (isFile) {
                    let absRef = ref.toString();
                    if (!ref.is('absolute')) {
                        if (this.baseUri.toString()) {
                            absRef = path_1.join(path_1.dirname(this.baseUri.toString()), absRef);
                        }
                        else {
                            absRef = '';
                        }
                    }
                    if (absRef) {
                        ref = new URI(vscode_uri_1.URI.file(absRef).fsPath.replace(/\\/g, '/')).fragment(ref.fragment());
                    }
                }
                else if (ref.scheme().includes('http') || (ref.scheme() === '' && this.baseUri.scheme().includes('http'))) {
                    if (this.baseUri.authority() !== '' && ref.authority() === '') {
                        ref = ref.absoluteTo(this.baseUri);
                    }
                }
            }
            if (this.transformRef) {
                return this.transformRef(Object.assign({}, opts, { ref, uri: this.baseUri }), this.ctx);
            }
            return ref;
        };
        this.atMaxUriDepth = () => {
            return this.uriStack.length >= 100;
        };
        this.lookupUri = (opts) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { ref } = opts;
            let scheme = ref.scheme();
            if (!this.resolvers[scheme] && this.isFile(ref)) {
                scheme = 'file';
            }
            const resolver = this.resolvers[scheme];
            if (!resolver) {
                throw new Error(`No resolver defined for scheme '${ref.scheme() || 'file'}' in ref ${ref.toString()}`);
            }
            let result = yield resolver.resolve(ref, this.ctx);
            if (this.parseResolveResult) {
                try {
                    const parsed = yield this.parseResolveResult({
                        uriResult: result,
                        result,
                        targetAuthority: ref,
                        parentAuthority: this.baseUri,
                        parentPath: opts.parentPath,
                        fragment: opts.fragment,
                    });
                    result = parsed.result;
                }
                catch (e) {
                    throw new Error(`Could not parse remote reference response for '${ref.toString()}' - ${String(e)}`);
                }
            }
            return new ResolveRunner(result, {
                depth: this.depth + 1,
                baseUri: ref.toString(),
                uriStack: this.uriStack,
                uriCache: this.uriCache,
                resolvers: this.resolvers,
                transformRef: this.transformRef,
                parseResolveResult: this.parseResolveResult,
                transformDereferenceResult: this.transformDereferenceResult,
                dereferenceRemote: this.dereferenceRemote,
                dereferenceInline: this.dereferenceInline,
                ctx: this.ctx,
            });
        });
        this.lookupAndResolveUri = (opts) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { val, ref, resolvingPointer, parentPointer, pointerStack } = opts;
            const parentPath = (opts.parentPath || []).slice();
            const uriCacheKey = this.computeUriCacheKey(ref);
            const lookupResult = {
                uri: ref,
                pointerStack,
                targetPath: resolvingPointer === parentPointer ? [] : parentPath,
            };
            if (this.uriStack.includes(uriCacheKey)) {
                lookupResult.resolved = {
                    result: val,
                    refMap: {},
                    errors: [],
                    runner: this,
                };
                return lookupResult;
            }
            else {
                let uriResolver;
                try {
                    if (this.atMaxUriDepth()) {
                        throw new Error(`Max uri depth (${this.uriStack.length}) reached. Halting, this is probably a circular loop.`);
                    }
                    uriResolver = yield this.lookupUri({
                        ref: ref.clone().fragment(''),
                        fragment: ref.fragment(),
                        cacheKey: uriCacheKey,
                        parentPath,
                    });
                    const currentAuthority = this.baseUri.toString();
                    if (currentAuthority && this.depth !== 0) {
                        uriResolver.uriStack = uriResolver.uriStack.concat([currentAuthority]);
                    }
                }
                catch (e) {
                    lookupResult.error = {
                        code: 'RESOLVE_URI',
                        message: String(e),
                        uri: ref,
                        uriStack: this.uriStack,
                        pointerStack,
                        path: parentPath,
                    };
                }
                if (uriResolver) {
                    lookupResult.resolved = yield uriResolver.resolve(Utils.uriToJSONPointer(ref), { parentPath });
                    if (lookupResult.resolved.errors.length) {
                        for (const error of lookupResult.resolved.errors) {
                            if (error.code === 'POINTER_MISSING' &&
                                error.path.join('/') === ref.fragment().slice(1)) {
                                const errorPathInResult = ref.fragment
                                    ? json_1.trimStart(error.path, json_1.trimStart(ref.fragment(), '/').split('/'))
                                    : error.path;
                                if (errorPathInResult && errorPathInResult.length) {
                                    lodash_1.set(lookupResult.resolved.result, errorPathInResult, val);
                                }
                                else if (lookupResult.resolved.result) {
                                    lookupResult.resolved.result = val;
                                }
                            }
                        }
                    }
                }
            }
            return lookupResult;
        });
        this.id = resolveRunnerCount += 1;
        this.depth = opts.depth || 0;
        this._source = source;
        this.resolvers = opts.resolvers || {};
        const baseUri = opts.baseUri || '';
        let uri = new URI(baseUri || '');
        if (this.isFile(uri)) {
            uri = new URI(vscode_uri_1.URI.file(baseUri).fsPath.replace(/\\/g, '/'));
        }
        this.baseUri = uri;
        this.uriStack = opts.uriStack || [];
        this.uriCache = opts.uriCache || new cache_1.Cache();
        if (this.baseUri && this.depth === 0) {
            this.uriCache.set(this.computeUriCacheKey(this.baseUri), this);
        }
        this.getRef = opts.getRef || exports.defaultGetRef;
        this.transformRef = opts.transformRef;
        if (this.depth) {
            this.dereferenceInline = true;
        }
        else {
            this.dereferenceInline = typeof opts.dereferenceInline !== 'undefined' ? opts.dereferenceInline : true;
        }
        this.dereferenceRemote = typeof opts.dereferenceRemote !== 'undefined' ? opts.dereferenceRemote : true;
        this.parseResolveResult = opts.parseResolveResult;
        this.transformDereferenceResult = opts.transformDereferenceResult;
        this.ctx = opts.ctx;
        this.lookupUri = memoize(this.lookupUri, {
            serializer: this._cacheKeySerializer,
            cache: {
                create: () => {
                    return this.uriCache;
                },
            },
        });
    }
    get source() {
        return this._source;
    }
    resolve(jsonPointer, opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const resolved = {
                result: this.source,
                refMap: {},
                errors: [],
                runner: this,
            };
            let targetPath;
            jsonPointer = jsonPointer && jsonPointer.trim();
            if (jsonPointer && jsonPointer !== '#' && jsonPointer !== '#/') {
                targetPath = json_1.pointerToPath(jsonPointer);
                resolved.result = lodash_1.get(resolved.result, targetPath);
            }
            if (!resolved.result) {
                resolved.errors.push({
                    code: 'POINTER_MISSING',
                    message: `'${jsonPointer}' does not exist @ '${this.baseUri.toString()}'`,
                    uri: this.baseUri,
                    uriStack: this.uriStack,
                    pointerStack: [],
                    path: targetPath || [],
                });
                return resolved;
            }
            const crawler = new crawler_1.ResolveCrawler(this, jsonPointer);
            crawler.computeGraph(resolved.result, targetPath, jsonPointer || '');
            let uriResults = [];
            if (crawler.resolvers.length) {
                uriResults = yield Promise.all(crawler.resolvers);
            }
            if (uriResults.length) {
                for (const r of uriResults) {
                    let resolvedTargetPath = r.targetPath;
                    if (!resolvedTargetPath.length)
                        resolvedTargetPath = targetPath || [];
                    resolved.refMap[String(this.baseUri.clone().fragment(json_1.pathToPointer(resolvedTargetPath)))] = String(r.uri);
                    if (r.error) {
                        resolved.errors.push(r.error);
                    }
                    if (!r.resolved)
                        continue;
                    if (r.resolved.errors) {
                        resolved.errors = resolved.errors.concat(r.resolved.errors);
                    }
                    if (!r.resolved.result)
                        continue;
                    this._source = immer_1.default(this._source, (draft) => {
                        if (r.resolved) {
                            if (!resolvedTargetPath.length) {
                                return r.resolved.result;
                            }
                            else {
                                lodash_1.set(draft, resolvedTargetPath, r.resolved.result);
                            }
                        }
                    });
                }
            }
            if (typeof this._source === 'object') {
                if (this.dereferenceInline) {
                    this._source = immer_1.default(this._source, (draft) => {
                        let processOrder = [];
                        try {
                            processOrder = crawler.pointerGraph.overallOrder();
                            for (const pointer of processOrder) {
                                const dependants = crawler.pointerGraph.dependantsOf(pointer);
                                if (!dependants.length)
                                    continue;
                                const pointerPath = json_1.pointerToPath(pointer);
                                const val = lodash_1.get(draft, pointerPath);
                                for (const dependant of dependants) {
                                    let isCircular;
                                    const dependantPath = json_1.pointerToPath(dependant);
                                    const dependantStems = crawler.pointerStemGraph.dependenciesOf(pointer);
                                    for (const stem of dependantStems) {
                                        if (json_1.startsWith(dependantPath, json_1.pointerToPath(stem))) {
                                            isCircular = true;
                                            break;
                                        }
                                    }
                                    if (isCircular)
                                        continue;
                                    resolved.refMap[json_1.pathToPointer(dependantPath)] = json_1.pathToPointer(pointerPath);
                                    if (val) {
                                        lodash_1.set(draft, dependantPath, val);
                                    }
                                    else {
                                        resolved.errors.push({
                                            code: 'POINTER_MISSING',
                                            message: `'${pointer}' does not exist`,
                                            path: dependantPath,
                                            uri: this.baseUri,
                                            uriStack: this.uriStack,
                                            pointerStack: [],
                                        });
                                    }
                                }
                            }
                        }
                        catch (e) {
                        }
                    });
                }
                if (targetPath) {
                    resolved.result = lodash_1.get(this._source, targetPath);
                }
                else {
                    resolved.result = this._source;
                }
            }
            else {
                resolved.result = this._source;
            }
            if (this.transformDereferenceResult) {
                const ref = new URI(jsonPointer || '');
                try {
                    const { result, error } = yield this.transformDereferenceResult({
                        source: this.source,
                        result: resolved.result,
                        targetAuthority: ref,
                        parentAuthority: this.baseUri,
                        parentPath: opts ? opts.parentPath || [] : [],
                        fragment: ref.fragment(),
                    });
                    resolved.result = result;
                    if (error) {
                        throw new Error(`Could not transform dereferenced result for '${ref.toString()}' - ${String(error)}`);
                    }
                }
                catch (e) {
                    resolved.errors.push({
                        code: 'TRANSFORM_DEREFERENCED',
                        message: `Error: Could not transform dereferenced result for '${this.baseUri.toString()}${ref.fragment() !== '' ? `#${ref.fragment()}` : ``}' - ${String(e)}`,
                        uri: ref,
                        uriStack: this.uriStack,
                        pointerStack: [],
                        path: targetPath,
                    });
                }
            }
            return resolved;
        });
    }
    _cacheKeySerializer(sOpts) {
        return sOpts && typeof sOpts === 'object' && sOpts.cacheKey ? sOpts.cacheKey : JSON.stringify(arguments);
    }
    computeUriCacheKey(ref) {
        return ref
            .clone()
            .fragment('')
            .toString();
    }
    isFile(ref) {
        const scheme = ref.scheme();
        if (scheme === 'file')
            return true;
        if (!scheme) {
            if (ref.toString().charAt(0) === '/')
                return true;
            if (this.baseUri) {
                const uriScheme = this.baseUri.scheme();
                return Boolean(!uriScheme || uriScheme === 'file' || !this.resolvers[uriScheme]);
            }
        }
        else if (!this.resolvers[scheme]) {
            return true;
        }
        return false;
    }
}
exports.ResolveRunner = ResolveRunner;
//# sourceMappingURL=runner.js.map