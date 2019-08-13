"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("@stoplight/path");
const fs_1 = require("fs");
const fetch = require('node-fetch');
function doRead(name, encoding) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (path_1.isURL(name)) {
            const response = yield fetch(name);
            if (!response.ok)
                throw new Error(response.statusText);
            return yield response.text();
        }
        else {
            try {
                return yield new Promise((resolve, reject) => {
                    fs_1.readFile(name, encoding, (err, data) => {
                        if (err !== null) {
                            reject(err);
                        }
                        else {
                            resolve(data);
                        }
                    });
                });
            }
            catch (ex) {
                throw new Error(`Could not read ${name}: ${ex.message}`);
            }
        }
    });
}
function readParsable(name, encoding) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            return yield doRead(name, encoding);
        }
        catch (ex) {
            throw new Error(`Could not parse ${name}: ${ex.message}`);
        }
    });
}
exports.readParsable = readParsable;
//# sourceMappingURL=reader.js.map