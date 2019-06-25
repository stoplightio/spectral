"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./cache");
const runner_1 = require("./runner");
class Resolver {
    constructor(opts = {}) {
        this.ctx = {};
        this.uriCache = opts.uriCache || new cache_1.Cache();
        this.resolvers = opts.resolvers || {};
        this.getRef = opts.getRef;
        this.transformRef = opts.transformRef;
        this.dereferenceInline = typeof opts.dereferenceInline !== 'undefined' ? opts.dereferenceInline : true;
        this.dereferenceRemote = typeof opts.dereferenceRemote !== 'undefined' ? opts.dereferenceRemote : true;
        this.parseResolveResult = opts.parseResolveResult;
        this.ctx = opts.ctx;
    }
    resolve(source, opts = {}) {
        const runner = new runner_1.ResolveRunner(source, Object.assign({ uriCache: this.uriCache, resolvers: this.resolvers, getRef: this.getRef, transformRef: this.transformRef, dereferenceInline: this.dereferenceInline, dereferenceRemote: this.dereferenceRemote, parseResolveResult: this.parseResolveResult }, opts, { ctx: Object.assign({}, this.ctx || {}, opts.ctx || {}) }));
        return runner.resolve(opts.jsonPointer);
    }
}
exports.Resolver = Resolver;
//# sourceMappingURL=resolver.js.map