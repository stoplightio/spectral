"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@oclif/command");
const path_1 = require("@stoplight/path");
const yaml_1 = require("@stoplight/yaml");
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const util_1 = require("util");
const formatters_1 = require("../../formatters");
const reader_1 = require("../../fs/reader");
const http_and_file_1 = require("../../resolvers/http-and-file");
const loader_1 = require("../../rulesets/loader");
const oas2_1 = require("../../rulesets/oas2");
const oas3_1 = require("../../rulesets/oas3");
const reader_2 = require("../../rulesets/reader");
const spectral_1 = require("../../spectral");
const config_1 = require("../../types/config");
const writeFileAsync = util_1.promisify(fs_1.writeFile);
class Lint extends command_1.Command {
    constructor() {
        super(...arguments);
        this.quiet = false;
    }
    run() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { args, flags } = this.parse(Lint);
            const { ruleset } = flags;
            let rules;
            const cwd = process.cwd();
            const lintConfig = mergeConfig(Object.assign({}, Lint.defaultLintConfig), flags);
            this.quiet = flags.quiet;
            const rulesetFile = ruleset || (yield loader_1.getDefaultRulesetFile(cwd));
            if (rulesetFile) {
                try {
                    rules = yield reader_2.readRulesFromRulesets(...(Array.isArray(rulesetFile) ? rulesetFile : [rulesetFile]).map(file => (path_1.isAbsolute(file) ? file : path_1.resolve(cwd, file))));
                }
                catch (ex) {
                    this.log(ex.message);
                    this.error(ex);
                }
            }
            if (args.source) {
                try {
                    yield lint(args.source, lintConfig, this, rules);
                }
                catch (ex) {
                    this.error(ex.message);
                }
            }
            else {
                this.error('You must specify a document to lint');
            }
        });
    }
    log(message, ...args) {
        if (!this.quiet) {
            super.log(message, ...args);
        }
    }
    print(message, ...args) {
        super.log(message, ...args);
    }
}
Lint.description = 'lint a JSON/YAML document from a file or URL';
Lint.examples = [
    `$ spectral lint .openapi.yaml
linting ./openapi.yaml
`,
];
Lint.defaultLintConfig = {
    encoding: 'utf8',
    format: config_1.OutputFormat.STYLISH,
    verbose: false,
};
Lint.flags = {
    help: command_1.flags.help({ char: 'h' }),
    encoding: command_1.flags.string({
        char: 'e',
        description: 'text encoding to use',
    }),
    format: command_1.flags.string({
        char: 'f',
        description: 'formatter to use for outputting results',
        options: ['json', 'stylish'],
    }),
    output: command_1.flags.string({
        char: 'o',
        description: 'output to a file instead of stdout',
    }),
    ruleset: command_1.flags.string({
        char: 'r',
        description: 'path to a ruleset file (supports remote files)',
        multiple: true,
    }),
    'skip-rule': command_1.flags.string({
        char: 's',
        description: 'ignore certain rules if they are causing trouble',
        multiple: true,
    }),
    verbose: command_1.flags.boolean({
        char: 'v',
        description: 'increase verbosity',
    }),
    quiet: command_1.flags.boolean({
        char: 'q',
        description: 'no logging - output only',
    }),
};
Lint.args = [{ name: 'source' }];
exports.default = Lint;
function tryReadOrLog(command, reader) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            return yield reader();
        }
        catch (ex) {
            if (ex.messages) {
                command.log(ex.messages[0]);
                command.error(ex.messages[1]);
            }
            else {
                command.error(ex);
            }
        }
    });
}
function lint(name, flags, command, rules) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (flags.verbose) {
            command.log(`Linting ${name}`);
        }
        let targetUri = name;
        if (!/^https?:\/\//.test(name)) {
            targetUri = path_1.resolve(name);
        }
        const spec = yaml_1.parseWithPointers(yield reader_1.readParsable(targetUri, flags.encoding), {
            ignoreDuplicateKeys: false,
            mergeKeys: true,
        });
        const spectral = new spectral_1.Spectral({ resolver: http_and_file_1.httpAndFileResolver });
        if (parseInt(spec.data.swagger) === 2) {
            command.log('Adding OpenAPI 2.0 (Swagger) functions');
            spectral.addFunctions(oas2_1.oas2Functions());
        }
        else if (parseInt(spec.data.openapi) === 3) {
            command.log('Adding OpenAPI 3.x functions');
            spectral.addFunctions(oas3_1.oas3Functions());
        }
        if (rules) {
            if (flags.verbose) {
                command.log(`Found ${Object.keys(rules).length} rules`);
            }
        }
        else {
            if (flags.verbose) {
                command.log('No rules loaded, attempting to detect document type');
            }
            if (parseInt(spec.data.swagger) === 2) {
                command.log('OpenAPI 2.0 (Swagger) detected');
                rules = yield tryReadOrLog(command, () => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield oas2_1.rules(); }));
            }
            else if (parseInt(spec.data.openapi) === 3) {
                command.log('OpenAPI 3.x detected');
                rules = yield tryReadOrLog(command, () => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield oas3_1.rules(); }));
            }
        }
        if (flags.skipRule) {
            rules = skipRules(Object.assign({}, rules), flags, command);
        }
        if (!rules) {
            throw new Error('No rules provided, and document type does not have any default rules, so lint has nothing to do');
        }
        spectral.addRules(rules);
        let results = [];
        try {
            const parsedResult = {
                source: targetUri,
                parsed: spec,
                getLocationForJsonPath: yaml_1.getLocationForJsonPath,
            };
            results = yield spectral.run(parsedResult, {
                resolve: {
                    documentUri: targetUri,
                },
            });
            if (results.length === 0) {
                command.log('No errors or warnings found!');
                return;
            }
        }
        catch (ex) {
            process.exitCode = 2;
            throw new Error(ex);
        }
        const output = yield formatOutput(results, flags);
        try {
            yield writeOutput(output, flags, command);
            process.exitCode = 1;
        }
        catch (ex) {
            process.exitCode = 2;
            throw new Error(ex);
        }
    });
}
const skipRules = (rules, flags, command) => {
    const skippedRules = [];
    const invalidRules = [];
    if (flags.skipRule !== undefined) {
        for (const rule of flags.skipRule) {
            if (rule in rules) {
                delete rules[rule];
                skippedRules.push(rule);
            }
            else {
                invalidRules.push(rule);
            }
        }
    }
    if (invalidRules.length !== 0) {
        command.warn(`ignoring invalid ${invalidRules.length > 1 ? 'rules' : 'rule'} "${invalidRules.join(', ')}"`);
    }
    if (skippedRules.length !== 0 && flags.verbose) {
        command.log(`INFO: skipping ${skippedRules.length > 1 ? 'rules' : 'rule'} "${skippedRules.join(', ')}"`);
    }
    return rules;
};
function formatOutput(results, flags) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return {
            json: () => formatters_1.json(results),
            stylish: () => formatters_1.stylish(results),
        }[flags.format]();
    });
}
function writeOutput(outputStr, flags, command) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (flags.output) {
            return writeFileAsync(flags.output, outputStr);
        }
        command.print(outputStr);
    });
}
exports.writeOutput = writeOutput;
function mergeConfig(config, flags) {
    return Object.assign({}, config, lodash_1.omitBy({
        encoding: flags.encoding,
        format: flags.format,
        output: flags.output,
        verbose: flags.verbose,
        ruleset: flags.ruleset,
        quiet: flags.quiet,
        skipRule: flags['skip-rule'],
    }, lodash_1.isNil));
}
//# sourceMappingURL=lint.js.map