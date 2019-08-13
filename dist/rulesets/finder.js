"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("@stoplight/path");
const fs = require("fs");
const map_1 = require("./map");
const SPECTRAL_SRC_ROOT = path.join(__dirname, '..');
function resolveSpectralVersion(pkg) {
    return pkg;
}
function resolveFromNPM(pkg) {
    try {
        return require.resolve(pkg);
    }
    catch (_a) {
        return path.join('https://unpkg.com/', resolveSpectralVersion(pkg));
    }
}
function resolveFromFS(from, to) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let targetPath;
        if (SPECTRAL_SRC_ROOT.length > 0 && SPECTRAL_SRC_ROOT !== '/' && to.startsWith('@stoplight/spectral')) {
            targetPath = path.join(SPECTRAL_SRC_ROOT, to.replace('@stoplight/spectral/', './'));
            if (yield exists(targetPath)) {
                return targetPath;
            }
        }
        targetPath = path.join(from, '..', to);
        if (yield exists(targetPath)) {
            return targetPath;
        }
        throw new Error('File does not exist');
    });
}
function findRuleset(from, to) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const mapped = map_1.rulesetsMap.get(to);
        if (mapped !== void 0) {
            to = mapped;
        }
        if (path.isAbsolute(to)) {
            return to;
        }
        if (path.isURL(from)) {
            return path.join(from, '..', to);
        }
        try {
            return yield resolveFromFS(from, to);
        }
        catch (_a) {
            return resolveFromNPM(to);
        }
    });
}
exports.findRuleset = findRuleset;
function exists(uri) {
    return new Promise(resolve => {
        fs.access(uri, fs.constants.F_OK, err => {
            resolve(err === null);
        });
    });
}
//# sourceMappingURL=finder.js.map