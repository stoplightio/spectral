"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dist_1 = require("@stoplight/json-ref-resolver/dist");
const path_1 = require("@stoplight/path");
const yaml_1 = require("@stoplight/yaml");
const fs = require("fs");
const http_1 = require("./http");
exports.httpAndFileResolver = new dist_1.Resolver({
    resolvers: {
        https: http_1.httpReader,
        http: http_1.httpReader,
        file: {
            resolve(ref) {
                return new Promise((resolve, reject) => {
                    const path = ref.path();
                    fs.readFile(path, 'utf8', (err, data) => {
                        if (err)
                            reject(err);
                        resolve(data);
                    });
                });
            },
        },
    },
    parseResolveResult: (opts) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const ext = path_1.extname(opts.targetAuthority.toString());
        if (ext === '.yml' || ext === '.yaml') {
            opts.result = yaml_1.parse(opts.result);
        }
        else if (ext === '.json') {
            opts.result = JSON.parse(opts.result);
        }
        return opts;
    }),
});
//# sourceMappingURL=http-and-file.js.map