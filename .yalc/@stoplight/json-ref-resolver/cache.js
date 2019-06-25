"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cache {
    constructor(opts = {}) {
        this._stats = {
            hits: 0,
            misses: 0,
        };
        this._data = {};
        this._stdTTL = opts.stdTTL;
    }
    get stats() {
        return this._stats;
    }
    get(key) {
        const d = this._data[key];
        if (d && (!this._stdTTL || new Date().getTime() - d.ts < this._stdTTL)) {
            this._stats.hits += 1;
            return d.val;
        }
        this._stats.misses += 1;
    }
    set(key, val) {
        this._data[key] = {
            ts: new Date().getTime(),
            val,
        };
    }
    has(key) {
        return key in this._data;
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map