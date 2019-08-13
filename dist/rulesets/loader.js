"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("@stoplight/path");
const fs = require("fs");
const DEFAULT_RULESET_FILE = /^\.?spectral\.(?:ya?ml|json)$/;
exports.getDefaultRulesetFile = (directory) => {
    return new Promise(resolve => {
        fs.readdir(directory, (err, files) => {
            if (err === null) {
                for (const file of files) {
                    if (DEFAULT_RULESET_FILE.test(file)) {
                        resolve(path_1.join(directory, file));
                        return;
                    }
                }
            }
            resolve(null);
        });
    });
};
//# sourceMappingURL=loader.js.map