"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const spectral_1 = require("./spectral");
class Resolved {
    constructor(spec, result, parsedMap) {
        this.spec = spec;
        this.parsedMap = parsedMap;
        this.refMap = result.refMap;
        this.result = result.result;
        this.errors = result.errors;
        this.runner = result.runner;
    }
    getParsedForJsonPath(path) {
        let target = this.parsedMap.refs;
        const newPath = [...path];
        let segment;
        while (newPath.length > 0) {
            segment = newPath.shift();
            if (segment && segment in target) {
                target = target[segment];
            }
            else {
                newPath.unshift(segment);
                break;
            }
        }
        if (target) {
            return {
                path: [...lodash_1.get(target, [spectral_1.REF_METADATA, 'root'], []), ...newPath],
                doc: lodash_1.get(this.parsedMap.parsed, lodash_1.get(target, [spectral_1.REF_METADATA, 'ref']), this.spec),
            };
        }
        return {
            path: newPath,
            doc: this.spec,
        };
    }
    getLocationForJsonPath(path, closest) {
        const parsedResult = this.getParsedForJsonPath(path);
        const location = parsedResult.doc.getLocationForJsonPath(parsedResult.doc.parsed, parsedResult.path, closest);
        return Object.assign({}, (parsedResult.doc.source && { uri: parsedResult.doc.source }), { range: location !== undefined
                ? location.range
                : {
                    start: {
                        line: 0,
                        character: 0,
                    },
                    end: {
                        line: 0,
                        character: 0,
                    },
                } });
    }
}
exports.Resolved = Resolved;
//# sourceMappingURL=resolved.js.map