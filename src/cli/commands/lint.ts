import { Command, flags as flagHelpers } from '@oclif/command';
import { IParserResult } from '@stoplight/types';
import { getLocationForJsonPath } from '@stoplight/yaml';
import { writeFile } from 'fs';
import { isNil, omitBy } from 'lodash';
import { resolve } from 'path';
import { promisify } from 'util';
import { IRuleResult } from '../..';
import { createEmptyConfig, getDefaultConfigFile, load as loadConfig } from '../../config/configLoader';
import { json, stylish } from '../../formatters';
import { readParsable } from '../../fs/reader';
import { oas2Functions, rules as oas2Rules } from '../../rulesets/oas2';
import { oas3Functions, rules as oas3Rules } from '../../rulesets/oas3';
import { readRulesFromRulesets } from '../../rulesets/reader';
import { Spectral } from '../../spectral';
import { IParsedResult, RuleCollection } from '../../types';
import { ConfigCommand, IConfig, ILintConfig } from '../../types/config';

const writeFileAsync = promisify(writeFile);
export default class Lint extends Command {
  public static description = 'lint a JSON/YAML document from a file or URL';

  public static examples = [
    `$ spectral lint .openapi.yaml
linting ./openapi.yaml
`,
  ];

  public static flags = {
    help: flagHelpers.help({ char: 'h' }),
    config: flagHelpers.string({
      char: 'c',
      description: 'path to a config file',
    }),
    encoding: flagHelpers.string({
      char: 'e',
      description: 'text encoding to use',
    }),
    format: flagHelpers.string({
      char: 'f',
      description: 'formatter to use for outputting results',
      options: ['json', 'stylish'],
    }),
    output: flagHelpers.string({
      char: 'o',
      description: 'output to a file instead of stdout',
    }),
    'max-results': flagHelpers.integer({
      description: '[default: all] maximum results to show',
    }),
    // @deprecated in 2.2, remove in 3.0
    maxResults: flagHelpers.integer({
      char: 'm',
      description: 'deprecated: use --max-results instead',
    }),
    ruleset: flagHelpers.string({
      char: 'r',
      description: 'path to a ruleset file (supports remote files)',
      multiple: true,
    }),
    'skip-rule': flagHelpers.string({
      char: 's',
      description: 'ignore certain rules if they are causing trouble',
      multiple: true,
    }),
    verbose: flagHelpers.boolean({
      char: 'v',
      description: 'increase verbosity',
    }),
  };

  public static args = [{ name: 'source' }];

  public async run() {
    const { args, flags } = this.parse(Lint);
    const { config: configFileFlag } = flags;

    let config: ILintConfig = mergeConfig(createEmptyConfig(), flags);

    const configFile = configFileFlag || getDefaultConfigFile(process.cwd()) || null;
    if (configFile) {
      try {
        const loadedConfig = await loadConfig(configFile, ConfigCommand.LINT);
        config = mergeConfig(loadedConfig, flags);
      } catch (ex) {
        this.error(`Cannot load provided config file. ${ex.message}.`);
      }
    }
    const { ruleset } = config;
    let rules;

    if (ruleset) {
      rules = await tryReadOrLog(this, async () => {
        return readRulesFromRulesets(...ruleset);
      });
    }

    if (args.source) {
      try {
        await lint(args.source, config, this, rules);
      } catch (ex) {
        this.error(ex.message);
      }
    } else {
      this.error('You must specify a document to lint');
    }
  }
}

async function tryReadOrLog(command: Lint, reader: Function) {
  try {
    return await reader();
  } catch (ex) {
    if (ex.messages) {
      command.log(ex.messages[0]);
      command.error(ex.messages[1]);
    } else {
      command.error(ex);
    }
  }
}

async function lint(name: string, flags: any, command: Lint, rules?: RuleCollection) {
  if (flags.verbose) {
    command.log(`Linting ${name}`);
  }
  const spec: IParserResult = await readParsable(name, flags.encoding);
  const spectral = new Spectral();
  if (parseInt(spec.data.swagger) === 2) {
    command.log('Adding OpenAPI 2.0 (Swagger) functions');
    spectral.addFunctions(oas2Functions());
  } else if (parseInt(spec.data.openapi) === 3) {
    command.log('Adding OpenAPI 3.x functions');
    spectral.addFunctions(oas3Functions());
  }

  if (rules) {
    if (flags.verbose) {
      command.log(`Found ${Object.keys(rules).length} rules`);
    }
  } else {
    if (flags.verbose) {
      command.log('No rules loaded, attempting to detect document type');
    }
    if (parseInt(spec.data.swagger) === 2) {
      command.log('OpenAPI 2.0 (Swagger) detected');
      rules = await tryReadOrLog(command, async () => await oas2Rules());
    } else if (parseInt(spec.data.openapi) === 3) {
      command.log('OpenAPI 3.x detected');
      rules = await tryReadOrLog(command, async () => await oas3Rules());
    }
  }

  if (flags.skipRule) {
    rules = skipRules({ ...rules }, flags, command);
  }
  if (!rules) {
    throw new Error('No rules provided, and document type does not have any default rules, so lint has nothing to do');
  }

  spectral.addRules(rules);

  let results = [];
  try {
    const parsedResult: IParsedResult = {
      source: resolve(process.cwd(), name),
      parsed: spec,
      getLocationForJsonPath,
    };

    results = await spectral.run(parsedResult);
    if (results.length === 0) {
      command.log('No errors or warnings found!');
      return;
    }
  } catch (ex) {
    process.exitCode = 2;
    throw new Error(ex);
  }

  const output = await formatOutput(results, flags);
  try {
    await writeOutput(output, flags, command);
    process.exitCode = 1;
  } catch (ex) {
    process.exitCode = 2;
    throw new Error(ex);
  }
}

const skipRules = (rules: any, flags: any, command: Lint): any => {
  const skippedRules: string[] = [];
  const invalidRules: string[] = [];

  for (const rule of flags.skipRule) {
    if (rule in rules) {
      delete rules[rule];
      skippedRules.push(rule);
    } else {
      invalidRules.push(rule);
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

async function formatOutput(results: IRuleResult[], flags: any): Promise<string> {
  if (flags.maxResults) {
    results = results.slice(0, flags.maxResults);
  }
  return {
    json: () => json(results),
    stylish: () => stylish(results),
  }[flags.format]();
}

export async function writeOutput(outputStr: string, flags: any, command: Lint) {
  if (flags.output) {
    return writeFileAsync(flags.output, outputStr);
  }

  command.log(outputStr);
}

function mergeConfig(config: IConfig, flags: any): ILintConfig {
  return {
    ...config.lint,
    ...omitBy<ILintConfig>(
      {
        encoding: flags.encoding,
        format: flags.format,
        output: flags.output,
        maxResults: flags.maxResults > 0 ? flags.maxResults : flags['max-results'],
        verbose: flags.verbose,
        ruleset: flags.ruleset,
        skipRule: flags['skip-rule'],
      },
      isNil,
    ),
  };
}
